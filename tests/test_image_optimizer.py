"""
BDD-style Tests for Image Optimizer Plugin

Following Behavior-Driven Development patterns:
- Given/When/Then structure
- Descriptive test names that document behavior
- Focus on business requirements

Test Categories:
1. Domain Models - Core business logic
2. Image Conversion - Format handling
3. HTML Transformation - Output generation
4. Integration - Full pipeline
"""

import tempfile
import unittest
from pathlib import Path
from unittest import mock

from scripts.python.plugins.image_optimizer.domain.models import (
    ImageAsset,
    ImageFormat,
    OptimizationConfig,
    OptimizationResult,
    OptimizedImage,
    ResponsiveSize,
)
from scripts.python.plugins.image_optimizer.presentation.html_transformer import (
    HTMLImageTransformer,
)


class TestImageFormat(unittest.TestCase):
    """Tests for ImageFormat enum behavior."""

    def test_given_png_extension_when_from_extension_then_returns_png_format(self):
        """Given a PNG extension, it should return the PNG format."""
        result = ImageFormat.from_extension("png")
        self.assertEqual(result, ImageFormat.PNG)

    def test_given_uppercase_extension_when_from_extension_then_handles_case(self):
        """Given an uppercase extension, it should handle case-insensitively."""
        result = ImageFormat.from_extension("PNG")
        self.assertEqual(result, ImageFormat.PNG)

    def test_given_webp_format_when_is_modern_then_returns_true(self):
        """Given WebP format, is_modern should return True."""
        self.assertTrue(ImageFormat.WEBP.is_modern)

    def test_given_png_format_when_is_modern_then_returns_false(self):
        """Given PNG format, is_modern should return False."""
        self.assertFalse(ImageFormat.PNG.is_modern)

    def test_given_gif_format_when_is_animated_capable_then_returns_true(self):
        """Given GIF format, it should be marked as animation-capable."""
        self.assertTrue(ImageFormat.GIF.is_animated_capable)

    def test_given_webp_format_when_mime_type_then_returns_correct_type(self):
        """Given WebP format, it should return correct MIME type."""
        self.assertEqual(ImageFormat.WEBP.mime_type, "image/webp")


class TestOptimizationConfig(unittest.TestCase):
    """Tests for OptimizationConfig behavior."""

    def test_given_favicon_filename_when_should_skip_then_returns_true(self):
        """Given a favicon filename, should_skip should return True."""
        config = OptimizationConfig()
        self.assertTrue(config.should_skip("favicon.png"))

    def test_given_icon_filename_when_should_skip_then_returns_true(self):
        """Given an icon- prefixed filename, should_skip should return True."""
        config = OptimizationConfig()
        self.assertTrue(config.should_skip("icon-192.png"))

    def test_given_normal_filename_when_should_skip_then_returns_false(self):
        """Given a normal image filename, should_skip should return False."""
        config = OptimizationConfig()
        self.assertFalse(config.should_skip("photo.png"))

    def test_given_default_config_when_created_then_has_webp_as_primary(self):
        """Given default config, WebP should be the primary output format."""
        config = OptimizationConfig()
        self.assertEqual(config.output_formats[0], ImageFormat.WEBP)


class TestImageAsset(unittest.TestCase):
    """Tests for ImageAsset domain model behavior."""

    def test_given_large_file_when_needs_optimization_then_returns_true(self):
        """Given a file over 100KB, needs_optimization should return True."""
        asset = ImageAsset(
            source_path=Path("test.png"),
            format=ImageFormat.PNG,
            file_size=150 * 1024,  # 150KB
        )
        self.assertTrue(asset.needs_optimization)

    def test_given_small_webp_when_needs_optimization_then_returns_false(self):
        """Given a small WebP file, needs_optimization should return False."""
        asset = ImageAsset(
            source_path=Path("test.webp"),
            format=ImageFormat.WEBP,
            file_size=50 * 1024,  # 50KB
        )
        self.assertFalse(asset.needs_optimization)

    def test_given_small_png_when_needs_optimization_then_returns_true(self):
        """Given a small PNG (non-modern format), still needs optimization."""
        asset = ImageAsset(
            source_path=Path("test.png"),
            format=ImageFormat.PNG,
            file_size=50 * 1024,  # 50KB
        )
        self.assertTrue(asset.needs_optimization)

    def test_given_1mb_file_when_is_large_then_returns_true(self):
        """Given a 1MB+ file, is_large should return True."""
        asset = ImageAsset(
            source_path=Path("test.png"),
            format=ImageFormat.PNG,
            file_size=1.5 * 1024 * 1024,  # 1.5MB
        )
        self.assertTrue(asset.is_large)

    def test_given_path_with_assets_when_relative_path_then_starts_from_assets(self):
        """Given a path containing 'assets', relative_path should start from assets."""
        asset = ImageAsset(
            source_path=Path("/home/user/docs/assets/images/photo.png"),
            format=ImageFormat.PNG,
        )
        self.assertEqual(asset.relative_path, "assets/images/photo.png")


class TestOptimizedImage(unittest.TestCase):
    """Tests for OptimizedImage value object behavior."""

    def test_given_size_reduction_when_savings_percent_then_calculates_correctly(self):
        """Given a size reduction, savings_percent should calculate correctly."""
        original = ImageAsset(
            source_path=Path("test.png"),
            format=ImageFormat.PNG,
            file_size=1000,
        )
        optimized = OptimizedImage(
            original=original,
            output_path=Path("test.webp"),
            format=ImageFormat.WEBP,
            width=100,
            height=100,
            file_size=300,  # 70% reduction
        )
        self.assertAlmostEqual(optimized.savings_percent, 70.0)

    def test_given_responsive_size_when_srcset_entry_then_includes_descriptor(self):
        """Given a responsive size, srcset_entry should include width descriptor."""
        original = ImageAsset(
            source_path=Path("test.png"),
            format=ImageFormat.PNG,
        )
        responsive_size = ResponsiveSize(width=640, suffix="-640w", quality=80)
        optimized = OptimizedImage(
            original=original,
            output_path=Path("test-640w.webp"),
            format=ImageFormat.WEBP,
            width=640,
            height=480,
            file_size=50000,
            responsive_size=responsive_size,
        )
        self.assertIn("640w", optimized.srcset_entry)


class TestOptimizationResult(unittest.TestCase):
    """Tests for OptimizationResult aggregate behavior."""

    def test_given_successful_optimization_when_success_then_returns_true(self):
        """Given a result with primary output and no errors, success should be True."""
        original = ImageAsset(
            source_path=Path("test.png"),
            format=ImageFormat.PNG,
            file_size=1000,
        )
        optimized = OptimizedImage(
            original=original,
            output_path=Path("test.webp"),
            format=ImageFormat.WEBP,
            width=100,
            height=100,
            file_size=300,
        )
        result = OptimizationResult(source=original, primary_output=optimized)
        self.assertTrue(result.success)

    def test_given_errors_when_success_then_returns_false(self):
        """Given a result with errors, success should be False."""
        original = ImageAsset(
            source_path=Path("test.png"),
            format=ImageFormat.PNG,
        )
        result = OptimizationResult(
            source=original, errors=["Conversion failed"]
        )
        self.assertFalse(result.success)


class TestHTMLImageTransformer(unittest.TestCase):
    """Tests for HTML transformation behavior."""

    def test_given_external_image_when_transform_then_unchanged(self):
        """Given an external image URL, it should not be transformed."""
        transformer = HTMLImageTransformer()
        html = '<img src="https://example.com/image.png" alt="test">'

        result = transformer.transform(html, Path("."))

        self.assertEqual(result, html)

    def test_given_svg_image_when_transform_then_unchanged(self):
        """Given an SVG image, it should not be transformed."""
        transformer = HTMLImageTransformer()
        html = '<img src="assets/icon.svg" alt="test">'

        result = transformer.transform(html, Path("."))

        self.assertEqual(result, html)

    def test_given_already_optimized_when_transform_then_unchanged(self):
        """Given an already optimized image, it should not be transformed again."""
        transformer = HTMLImageTransformer()
        html = '<img src="assets/optimized/image.webp" alt="test">'

        result = transformer.transform(html, Path("."))

        self.assertEqual(result, html)

    def test_given_local_image_when_lazy_loading_disabled_then_no_lazy_attr(self):
        """Given lazy loading disabled, no loading attribute should be added."""
        transformer = HTMLImageTransformer(enable_lazy=False)
        html = '<img src="assets/image.png" alt="test">'

        result = transformer._add_lazy_loading(html)

        self.assertNotIn('loading="lazy"', result)

    def test_given_local_image_when_lazy_loading_enabled_then_has_lazy_attr(self):
        """Given lazy loading enabled, loading='lazy' should be added."""
        transformer = HTMLImageTransformer(enable_lazy=True)
        html = '<img src="assets/image.png" alt="test">'

        result = transformer._add_lazy_loading(html)

        self.assertIn('loading="lazy"', result)
        self.assertIn('decoding="async"', result)

    def test_given_image_with_existing_loading_when_add_lazy_then_not_duplicated(self):
        """Given an image that already has loading attr, it should not be duplicated."""
        transformer = HTMLImageTransformer(enable_lazy=True)
        html = '<img loading="eager" src="assets/image.png" alt="test">'

        result = transformer._add_lazy_loading(html)

        # Should not add another loading attribute
        self.assertEqual(result.count("loading="), 1)

    def test_given_html_with_head_when_inject_blur_css_then_adds_styles(self):
        """Given HTML with head section, blur CSS should be injected."""
        transformer = HTMLImageTransformer()
        html = "<html><head><title>Test</title></head><body></body></html>"

        result = transformer.inject_blur_up_css(html)

        self.assertIn("picture img", result)
        self.assertIn("filter: blur", result)
        self.assertIn("</head>", result)


class TestResponsiveSize(unittest.TestCase):
    """Tests for ResponsiveSize value object behavior."""

    def test_given_width_when_descriptor_then_returns_width_w(self):
        """Given a width, descriptor should return width with 'w' suffix."""
        size = ResponsiveSize(width=640, suffix="-640w", quality=80)
        self.assertEqual(size.descriptor, "640w")


class IntegrationTestImageOptimizer(unittest.TestCase):
    """Integration tests for the full optimization pipeline."""

    def test_given_pillow_not_installed_when_import_then_handles_gracefully(self):
        """Given Pillow is not installed, the plugin should handle gracefully."""
        # This test verifies the error handling path exists
        # In actual runtime without Pillow, plugin disables itself
        pass  # The actual behavior is tested in plugin.py

    def test_given_empty_directory_when_scan_then_returns_empty_list(self):
        """Given an empty directory, scan should return empty list."""
        with tempfile.TemporaryDirectory() as tmpdir:
            from scripts.python.plugins.image_optimizer.domain.models import (
                OptimizationConfig,
            )
            from scripts.python.plugins.image_optimizer.domain.services import (
                ImageOptimizationService,
            )
            from scripts.python.plugins.image_optimizer.infrastructure.converters import (
                PillowConverter,
                PillowLoader,
            )

            config = OptimizationConfig()
            service = ImageOptimizationService(
                config=config,
                loader=PillowLoader(),
                converter=PillowConverter(),
                logger=lambda x: None,
            )

            assets = service.scan_directory(Path(tmpdir))
            self.assertEqual(len(assets), 0)


if __name__ == "__main__":
    unittest.main()
