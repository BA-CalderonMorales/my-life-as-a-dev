"""
Domain Models for Image Optimization

Following DDD principles, these models represent the core domain concepts
for image optimization without any infrastructure concerns.

Principles applied:
- Single Responsibility: Each model has one clear purpose
- Value Objects: Immutable data containers
- Rich Domain Models: Business logic encapsulated in models
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Optional


class ImageFormat(Enum):
    """Supported image formats for optimization."""

    PNG = "png"
    JPEG = "jpeg"
    JPG = "jpg"
    GIF = "gif"
    WEBP = "webp"
    AVIF = "avif"
    SVG = "svg"

    @classmethod
    def from_extension(cls, ext: str) -> Optional["ImageFormat"]:
        """Get format from file extension."""
        ext = ext.lower().lstrip(".")
        for fmt in cls:
            if fmt.value == ext:
                return fmt
        return None

    @property
    def is_modern(self) -> bool:
        """Check if this is a modern optimized format."""
        return self in (ImageFormat.WEBP, ImageFormat.AVIF)

    @property
    def is_animated_capable(self) -> bool:
        """Check if format supports animation."""
        return self in (ImageFormat.GIF, ImageFormat.WEBP)

    @property
    def mime_type(self) -> str:
        """Get MIME type for the format."""
        mime_map = {
            ImageFormat.PNG: "image/png",
            ImageFormat.JPEG: "image/jpeg",
            ImageFormat.JPG: "image/jpeg",
            ImageFormat.GIF: "image/gif",
            ImageFormat.WEBP: "image/webp",
            ImageFormat.AVIF: "image/avif",
            ImageFormat.SVG: "image/svg+xml",
        }
        return mime_map.get(self, "application/octet-stream")


class DeviceProfile(Enum):
    """Target device profiles for responsive images."""

    MOBILE = "mobile"
    TABLET = "tablet"
    DESKTOP = "desktop"
    LOW_POWER = "low_power"  # Samsung Fridge, older devices


@dataclass(frozen=True)
class ResponsiveSize:
    """Value object representing a responsive image size."""

    width: int
    suffix: str
    quality: int = 80

    @property
    def descriptor(self) -> str:
        """Get srcset descriptor (e.g., '320w')."""
        return f"{self.width}w"


@dataclass(frozen=True)
class OptimizationConfig:
    """
    Configuration for image optimization.

    Follows Open/Closed principle - extend via composition, not modification.
    """

    # Output formats (order matters - first is primary)
    output_formats: tuple[ImageFormat, ...] = (ImageFormat.WEBP,)

    # Responsive sizes for srcset generation
    responsive_sizes: tuple[ResponsiveSize, ...] = (
        ResponsiveSize(width=320, suffix="-320w", quality=75),
        ResponsiveSize(width=640, suffix="-640w", quality=80),
        ResponsiveSize(width=1024, suffix="-1024w", quality=85),
        ResponsiveSize(width=1920, suffix="-1920w", quality=90),
    )

    # Quality settings
    webp_quality: int = 80
    avif_quality: int = 70
    jpeg_quality: int = 85

    # LQIP (Low Quality Image Placeholder) settings
    generate_lqip: bool = True
    lqip_width: int = 20
    lqip_quality: int = 20

    # Processing settings
    max_dimension: int = 2560
    strip_metadata: bool = True
    preserve_animation: bool = True

    # GIF optimization
    gif_to_webp: bool = True
    gif_max_colors: int = 256

    # Skip patterns
    skip_patterns: tuple[str, ...] = ("favicon", "icon-")

    # Lazy loading
    enable_lazy_loading: bool = True
    lazy_load_threshold: int = 0  # Pixels from viewport

    def should_skip(self, filename: str) -> bool:
        """Check if file should be skipped based on patterns."""
        name_lower = filename.lower()
        return any(pattern in name_lower for pattern in self.skip_patterns)


@dataclass
class ImageAsset:
    """
    Domain entity representing an image asset to be optimized.

    Rich domain model with business logic for determining optimization needs.
    """

    source_path: Path
    format: ImageFormat
    width: int = 0
    height: int = 0
    file_size: int = 0
    is_animated: bool = False

    @classmethod
    def from_path(cls, path: Path) -> Optional["ImageAsset"]:
        """Factory method to create ImageAsset from file path."""
        if not path.exists():
            return None

        ext = path.suffix.lower().lstrip(".")
        fmt = ImageFormat.from_extension(ext)
        if not fmt:
            return None

        return cls(
            source_path=path,
            format=fmt,
            file_size=path.stat().st_size,
        )

    @property
    def size_kb(self) -> float:
        """Get file size in kilobytes."""
        return self.file_size / 1024

    @property
    def size_mb(self) -> float:
        """Get file size in megabytes."""
        return self.file_size / (1024 * 1024)

    @property
    def needs_optimization(self) -> bool:
        """Determine if this image needs optimization."""
        # Always optimize if over 100KB
        if self.size_kb > 100:
            return True
        # Optimize if not already a modern format
        if not self.format.is_modern:
            return True
        return False

    @property
    def is_large(self) -> bool:
        """Check if image is considered large (>1MB)."""
        return self.size_mb > 1

    @property
    def relative_path(self) -> str:
        """Get path relative to assets directory."""
        parts = self.source_path.parts
        if "assets" in parts:
            idx = parts.index("assets")
            return str(Path(*parts[idx:]))
        return str(self.source_path.name)


@dataclass
class OptimizedImage:
    """
    Value object representing an optimized image output.

    Immutable result of the optimization process.
    """

    original: ImageAsset
    output_path: Path
    format: ImageFormat
    width: int
    height: int
    file_size: int
    is_lqip: bool = False
    is_responsive_variant: bool = False
    responsive_size: Optional[ResponsiveSize] = None

    @property
    def size_kb(self) -> float:
        """Get file size in kilobytes."""
        return self.file_size / 1024

    @property
    def savings_percent(self) -> float:
        """Calculate size reduction percentage."""
        if self.original.file_size == 0:
            return 0
        return (
            (self.original.file_size - self.file_size) / self.original.file_size
        ) * 100

    @property
    def srcset_entry(self) -> str:
        """Get srcset entry for this image."""
        if self.responsive_size:
            return f"{self.output_path.name} {self.responsive_size.descriptor}"
        return f"{self.output_path.name} {self.width}w"


@dataclass
class OptimizationResult:
    """
    Aggregate root for optimization results.

    Contains all outputs from optimizing a single source image.
    """

    source: ImageAsset
    primary_output: Optional[OptimizedImage] = None
    responsive_variants: list[OptimizedImage] = field(default_factory=list)
    lqip: Optional[OptimizedImage] = None
    errors: list[str] = field(default_factory=list)

    @property
    def success(self) -> bool:
        """Check if optimization was successful."""
        return self.primary_output is not None and len(self.errors) == 0

    @property
    def total_savings_kb(self) -> float:
        """Calculate total size savings in KB."""
        if not self.primary_output:
            return 0
        return self.source.size_kb - self.primary_output.size_kb

    @property
    def all_outputs(self) -> list[OptimizedImage]:
        """Get all output images."""
        outputs = []
        if self.primary_output:
            outputs.append(self.primary_output)
        outputs.extend(self.responsive_variants)
        if self.lqip:
            outputs.append(self.lqip)
        return outputs
