"""
Infrastructure Layer - Image Converters

Concrete implementations of image conversion using Pillow.
These implement the protocols defined in the domain layer.

Principles applied:
- Liskov Substitution: Implements domain protocols
- Single Responsibility: Only handles format conversion
- Dependency Inversion: Domain depends on protocol, not this impl
"""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

from PIL import Image, ImageSequence

from ..domain.models import ImageAsset, ImageFormat, OptimizedImage

if TYPE_CHECKING:
    pass


class PillowLoader:
    """
    Pillow-based image loader.

    Implements the ImageLoader protocol from the domain layer.
    """

    def load(self, path: Path) -> Image.Image:
        """Load an image from disk."""
        img = Image.open(path)
        return img

    def get_dimensions(self, path: Path) -> tuple[int, int]:
        """Get image dimensions without fully loading."""
        with Image.open(path) as img:
            return img.size

    def is_animated(self, path: Path) -> bool:
        """Check if image is animated (GIF with multiple frames)."""
        try:
            with Image.open(path) as img:
                try:
                    img.seek(1)
                    return True
                except EOFError:
                    return False
        except Exception:
            return False


class PillowConverter:
    """
    Pillow-based image converter.

    Implements the ImageConverter protocol from the domain layer.
    Handles conversion to WebP, AVIF, and other formats.
    """

    def __init__(self, strip_metadata: bool = True) -> None:
        self.strip_metadata = strip_metadata

    def convert(
        self,
        image: Image.Image,
        output_path: Path,
        format: ImageFormat,
        quality: int,
    ) -> OptimizedImage:
        """
        Convert an image to the specified format.

        Handles both static and animated images appropriately.
        """
        # Get original asset info for tracking
        original = ImageAsset(
            source_path=output_path.parent.parent / output_path.stem.split("-")[0],
            format=ImageFormat.from_extension(output_path.suffix) or ImageFormat.PNG,
            width=image.size[0],
            height=image.size[1],
            file_size=0,  # Will be set from actual source
        )

        # Check if animated
        is_animated = self._is_animated(image)

        if is_animated and format.is_animated_capable:
            self._save_animated(image, output_path, format, quality)
        else:
            self._save_static(image, output_path, format, quality)

        # Get output file size
        file_size = output_path.stat().st_size if output_path.exists() else 0

        return OptimizedImage(
            original=original,
            output_path=output_path,
            format=format,
            width=image.size[0],
            height=image.size[1],
            file_size=file_size,
        )

    def resize(
        self,
        image: Image.Image,
        width: int,
        height: int | None = None,
    ) -> Image.Image:
        """
        Resize an image while maintaining aspect ratio.

        Uses high-quality LANCZOS resampling.
        """
        if height is None:
            # Calculate height maintaining aspect ratio
            ratio = width / image.size[0]
            height = int(image.size[1] * ratio)

        # Use high-quality resampling
        resized = image.resize((width, height), Image.Resampling.LANCZOS)
        return resized

    def _is_animated(self, image: Image.Image) -> bool:
        """Check if image has multiple frames."""
        try:
            image.seek(1)
            image.seek(0)
            return True
        except EOFError:
            return False

    def _save_static(
        self,
        image: Image.Image,
        output_path: Path,
        format: ImageFormat,
        quality: int,
    ) -> None:
        """Save a static image."""
        # Ensure output directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Convert to RGB/RGBA as needed
        if format in (ImageFormat.JPEG, ImageFormat.JPG):
            # JPEG doesn't support transparency
            if image.mode in ("RGBA", "LA", "P"):
                image = image.convert("RGB")
        elif image.mode == "P":
            # Convert palette mode to RGBA
            image = image.convert("RGBA")

        # Build save options
        save_options = self._get_save_options(format, quality)

        # Save the image
        image.save(output_path, **save_options)

    def _save_animated(
        self,
        image: Image.Image,
        output_path: Path,
        format: ImageFormat,
        quality: int,
    ) -> None:
        """Save an animated image (preserving all frames)."""
        output_path.parent.mkdir(parents=True, exist_ok=True)

        frames = []
        durations = []

        try:
            for frame_num in range(getattr(image, "n_frames", 1)):
                image.seek(frame_num)
                # Copy frame and convert if needed
                frame = image.copy()
                if frame.mode == "P":
                    frame = frame.convert("RGBA")
                frames.append(frame)

                # Get frame duration
                duration = image.info.get("duration", 100)
                durations.append(duration)

        except EOFError:
            pass

        if not frames:
            # Fallback to static save
            self._save_static(image, output_path, format, quality)
            return

        # Save animated WebP
        if format == ImageFormat.WEBP:
            save_options = {
                "format": "WEBP",
                "save_all": True,
                "append_images": frames[1:] if len(frames) > 1 else [],
                "duration": durations,
                "loop": 0,  # Infinite loop
                "quality": quality,
                "method": 4,  # Compression method (0-6, higher = better but slower)
            }
            frames[0].save(output_path, **save_options)
        elif format == ImageFormat.GIF:
            save_options = {
                "format": "GIF",
                "save_all": True,
                "append_images": frames[1:] if len(frames) > 1 else [],
                "duration": durations,
                "loop": 0,
                "optimize": True,
            }
            frames[0].save(output_path, **save_options)
        else:
            # For non-animated formats, just save first frame
            self._save_static(frames[0], output_path, format, quality)

    def _get_save_options(
        self,
        format: ImageFormat,
        quality: int,
    ) -> dict:
        """Get format-specific save options."""
        if format == ImageFormat.WEBP:
            return {
                "format": "WEBP",
                "quality": quality,
                "method": 4,
            }
        elif format == ImageFormat.AVIF:
            # Note: AVIF support requires pillow-avif-plugin
            return {
                "format": "AVIF",
                "quality": quality,
            }
        elif format in (ImageFormat.JPEG, ImageFormat.JPG):
            return {
                "format": "JPEG",
                "quality": quality,
                "optimize": True,
            }
        elif format == ImageFormat.PNG:
            return {
                "format": "PNG",
                "optimize": True,
            }
        elif format == ImageFormat.GIF:
            return {
                "format": "GIF",
                "optimize": True,
            }
        else:
            return {"format": format.value.upper()}


class ImageOptimizerFactory:
    """
    Factory for creating optimizer instances.

    Encapsulates the creation of properly configured optimizer components.
    Follows Factory pattern for testability and configuration flexibility.
    """

    @staticmethod
    def create_loader() -> PillowLoader:
        """Create a configured image loader."""
        return PillowLoader()

    @staticmethod
    def create_converter(strip_metadata: bool = True) -> PillowConverter:
        """Create a configured image converter."""
        return PillowConverter(strip_metadata=strip_metadata)
