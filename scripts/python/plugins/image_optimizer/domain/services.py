"""
Domain Services for Image Optimization

Business logic layer that orchestrates image optimization without
infrastructure concerns. Uses dependency injection for converters.

Principles applied:
- Dependency Inversion: Depends on abstractions (protocols)
- Single Responsibility: Only coordinates optimization flow
- Open/Closed: Extensible via converter injection
"""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING, Callable, Protocol

from .models import (
    ImageAsset,
    ImageFormat,
    OptimizationConfig,
    OptimizationResult,
    OptimizedImage,
    ResponsiveSize,
)

if TYPE_CHECKING:
    from PIL import Image


class ImageConverter(Protocol):
    """Protocol for image converters (Dependency Inversion Principle)."""

    def convert(
        self,
        image: "Image.Image",
        output_path: Path,
        format: ImageFormat,
        quality: int,
    ) -> OptimizedImage: ...

    def resize(
        self,
        image: "Image.Image",
        width: int,
        height: int | None = None,
    ) -> "Image.Image": ...


class ImageLoader(Protocol):
    """Protocol for loading images."""

    def load(self, path: Path) -> "Image.Image": ...

    def get_dimensions(self, path: Path) -> tuple[int, int]: ...

    def is_animated(self, path: Path) -> bool: ...


class ImageOptimizationService:
    """
    Domain service for orchestrating image optimization.

    Coordinates the optimization workflow without knowing implementation details.
    Uses injected converters and loaders for actual image processing.
    """

    def __init__(
        self,
        config: OptimizationConfig,
        loader: ImageLoader,
        converter: ImageConverter,
        logger: Callable[[str], None] | None = None,
    ) -> None:
        self.config = config
        self.loader = loader
        self.converter = converter
        self.log = logger or print

    def optimize(self, asset: ImageAsset) -> OptimizationResult:
        """
        Optimize a single image asset.

        Returns an OptimizationResult containing all generated outputs.
        """
        result = OptimizationResult(source=asset)

        # Check if we should skip this file
        if self.config.should_skip(asset.source_path.name):
            self.log(f"  Skipping (matched skip pattern): {asset.source_path.name}")
            return result

        try:
            # Load the source image
            image = self.loader.load(asset.source_path)
            asset.width, asset.height = image.size
            asset.is_animated = self.loader.is_animated(asset.source_path)

            # Determine output directory
            output_dir = asset.source_path.parent / "optimized"
            output_dir.mkdir(exist_ok=True)

            # Handle animated images specially
            if asset.is_animated and asset.format == ImageFormat.GIF:
                result = self._optimize_animated(asset, image, output_dir, result)
            else:
                result = self._optimize_static(asset, image, output_dir, result)

            # Generate LQIP if enabled
            if self.config.generate_lqip and result.success:
                result.lqip = self._generate_lqip(asset, image, output_dir)

        except Exception as e:
            result.errors.append(f"Optimization failed: {str(e)}")
            self.log(f"  Error: {e}")

        return result

    def _optimize_static(
        self,
        asset: ImageAsset,
        image: "Image.Image",
        output_dir: Path,
        result: OptimizationResult,
    ) -> OptimizationResult:
        """Optimize a static (non-animated) image."""
        # Resize if too large
        if max(asset.width, asset.height) > self.config.max_dimension:
            ratio = self.config.max_dimension / max(asset.width, asset.height)
            new_width = int(asset.width * ratio)
            new_height = int(asset.height * ratio)
            image = self.converter.resize(image, new_width, new_height)
            self.log(f"  Resized: {asset.width}x{asset.height} -> {new_width}x{new_height}")

        # Convert to primary format (WebP)
        primary_format = self.config.output_formats[0]
        quality = self._get_quality(primary_format)

        stem = asset.source_path.stem
        primary_path = output_dir / f"{stem}.{primary_format.value}"

        result.primary_output = self.converter.convert(
            image, primary_path, primary_format, quality
        )
        self.log(
            f"  Created: {primary_path.name} "
            f"({result.primary_output.size_kb:.1f}KB, "
            f"-{result.primary_output.savings_percent:.1f}%)"
        )

        # Generate responsive variants
        result.responsive_variants = self._generate_responsive_variants(
            asset, image, output_dir, primary_format
        )

        return result

    def _optimize_animated(
        self,
        asset: ImageAsset,
        image: "Image.Image",
        output_dir: Path,
        result: OptimizationResult,
    ) -> OptimizationResult:
        """Optimize an animated image (GIF)."""
        if self.config.gif_to_webp:
            # Convert animated GIF to animated WebP
            stem = asset.source_path.stem
            output_path = output_dir / f"{stem}.webp"

            result.primary_output = self.converter.convert(
                image,
                output_path,
                ImageFormat.WEBP,
                self.config.webp_quality,
            )
            self.log(
                f"  Created animated WebP: {output_path.name} "
                f"({result.primary_output.size_kb:.1f}KB, "
                f"-{result.primary_output.savings_percent:.1f}%)"
            )
        else:
            # Keep as GIF but optimize
            stem = asset.source_path.stem
            output_path = output_dir / f"{stem}-optimized.gif"

            result.primary_output = self.converter.convert(
                image,
                output_path,
                ImageFormat.GIF,
                100,  # GIF doesn't use quality
            )

        return result

    def _generate_responsive_variants(
        self,
        asset: ImageAsset,
        image: "Image.Image",
        output_dir: Path,
        format: ImageFormat,
    ) -> list[OptimizedImage]:
        """Generate responsive image variants for srcset."""
        variants = []

        for size in self.config.responsive_sizes:
            # Skip sizes larger than original
            if size.width >= asset.width:
                continue

            # Calculate proportional height
            ratio = size.width / asset.width
            new_height = int(asset.height * ratio)

            # Resize image
            resized = self.converter.resize(image, size.width, new_height)

            # Save variant
            stem = asset.source_path.stem
            variant_path = output_dir / f"{stem}{size.suffix}.{format.value}"

            variant = self.converter.convert(
                resized, variant_path, format, size.quality
            )
            variant.is_responsive_variant = True
            variant.responsive_size = size

            variants.append(variant)
            self.log(f"    Variant: {variant_path.name} ({variant.size_kb:.1f}KB)")

        return variants

    def _generate_lqip(
        self,
        asset: ImageAsset,
        image: "Image.Image",
        output_dir: Path,
    ) -> OptimizedImage | None:
        """Generate Low Quality Image Placeholder."""
        try:
            # Calculate proportional dimensions
            ratio = self.config.lqip_width / asset.width
            lqip_height = max(1, int(asset.height * ratio))

            # Resize to tiny
            lqip_image = self.converter.resize(
                image, self.config.lqip_width, lqip_height
            )

            # Save as base64-ready WebP
            stem = asset.source_path.stem
            lqip_path = output_dir / f"{stem}-lqip.webp"

            lqip = self.converter.convert(
                lqip_image,
                lqip_path,
                ImageFormat.WEBP,
                self.config.lqip_quality,
            )
            lqip.is_lqip = True

            self.log(f"    LQIP: {lqip_path.name} ({lqip.file_size} bytes)")
            return lqip

        except Exception as e:
            self.log(f"    LQIP generation failed: {e}")
            return None

    def _get_quality(self, format: ImageFormat) -> int:
        """Get quality setting for format."""
        quality_map = {
            ImageFormat.WEBP: self.config.webp_quality,
            ImageFormat.AVIF: self.config.avif_quality,
            ImageFormat.JPEG: self.config.jpeg_quality,
            ImageFormat.JPG: self.config.jpeg_quality,
        }
        return quality_map.get(format, 85)

    def scan_directory(self, directory: Path) -> list[ImageAsset]:
        """Scan a directory for optimizable images."""
        assets = []
        extensions = ("png", "jpg", "jpeg", "gif")

        for ext in extensions:
            for path in directory.rglob(f"*.{ext}"):
                # Skip already optimized images
                if "optimized" in str(path):
                    continue

                asset = ImageAsset.from_path(path)
                if asset:
                    assets.append(asset)

        return assets

    def optimize_all(self, assets: list[ImageAsset]) -> list[OptimizationResult]:
        """Optimize all provided assets."""
        results = []
        total_savings = 0

        for asset in assets:
            self.log(f"Optimizing: {asset.relative_path} ({asset.size_kb:.1f}KB)")
            result = self.optimize(asset)
            results.append(result)

            if result.success:
                total_savings += result.total_savings_kb

        self.log(f"\nTotal savings: {total_savings:.1f}KB ({total_savings/1024:.2f}MB)")
        return results
