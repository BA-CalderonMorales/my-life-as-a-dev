"""
MkDocs/Zensical Image Optimizer Plugin

Build-time image optimization plugin that integrates with MkDocs/Zensical.

Features:
- Converts images to WebP at build time
- Generates responsive image sizes
- Creates low-quality image placeholders (LQIP)
- Transforms HTML to use <picture> elements
- Adds lazy loading and async decoding

Usage in mkdocs.yml or zensical.toml:
    plugins:
      - image-optimizer:
          enabled: true
          webp_quality: 80
          generate_lqip: true

Author: Brandon A. Calderon Morales
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from mkdocs.config import config_options
from mkdocs.config.defaults import MkDocsConfig
from mkdocs.plugins import BasePlugin
from mkdocs.structure.files import Files
from mkdocs.structure.pages import Page

from .domain.models import ImageAsset, OptimizationConfig
from .domain.services import ImageOptimizationService
from .infrastructure.converters import PillowConverter, PillowLoader
from .presentation.html_transformer import HTMLImageTransformer


class ImageOptimizerConfig:
    """Configuration options for the image optimizer plugin."""

    enabled = config_options.Type(bool, default=True)
    webp_quality = config_options.Type(int, default=80)
    avif_quality = config_options.Type(int, default=70)
    generate_lqip = config_options.Type(bool, default=True)
    lqip_width = config_options.Type(int, default=20)
    enable_lazy_loading = config_options.Type(bool, default=True)
    skip_patterns = config_options.Type(list, default=["favicon", "icon-"])
    max_dimension = config_options.Type(int, default=2560)
    responsive_sizes = config_options.Type(
        list, default=[320, 640, 1024, 1920]
    )


class ImageOptimizerPlugin(BasePlugin[ImageOptimizerConfig]):
    """
    MkDocs plugin for build-time image optimization.

    Hooks into:
    - on_pre_build: Scan and optimize images
    - on_page_content: Transform HTML to use optimized images
    - on_post_build: Generate optimization report
    """

    def __init__(self) -> None:
        super().__init__()
        self._optimization_results: list[Any] = []
        self._docs_dir: Path | None = None
        self._site_dir: Path | None = None
        self._transformer: HTMLImageTransformer | None = None

    def on_config(self, config: MkDocsConfig) -> MkDocsConfig:
        """Store config and prepare for optimization."""
        self._docs_dir = Path(config.docs_dir)
        self._site_dir = Path(config.site_dir)

        # Log configuration
        if self.config.enabled:
            self._log("Image Optimizer Plugin enabled")
            self._log(f"  WebP quality: {self.config.webp_quality}")
            self._log(f"  LQIP enabled: {self.config.generate_lqip}")
            self._log(f"  Lazy loading: {self.config.enable_lazy_loading}")

        return config

    def on_pre_build(self, config: MkDocsConfig) -> None:
        """
        Optimize images before the build starts.

        This runs once at the start of the build and processes all images
        in the docs directory.
        """
        if not self.config.enabled:
            return

        # Check if Pillow is available
        try:
            from PIL import Image
        except ImportError:
            self._log(
                "WARNING: Pillow not installed. Image optimization disabled.",
                level="warning",
            )
            self.config.enabled = False
            return

        self._log("Scanning for images to optimize...")

        # Create optimization config
        opt_config = self._create_optimization_config()

        # Create service with injected dependencies
        loader = PillowLoader()
        converter = PillowConverter(strip_metadata=True)
        service = ImageOptimizationService(
            config=opt_config,
            loader=loader,
            converter=converter,
            logger=self._log,
        )

        # Scan for images
        if self._docs_dir:
            assets_dir = self._docs_dir / "assets" / "images"
            if assets_dir.exists():
                assets = service.scan_directory(assets_dir)
                self._log(f"Found {len(assets)} images to process")

                # Optimize all images
                self._optimization_results = service.optimize_all(assets)

                # Report results
                self._report_results()

        # Initialize HTML transformer
        self._transformer = HTMLImageTransformer(
            optimized_dir="optimized",
            enable_lazy=self.config.enable_lazy_loading,
            enable_lqip=self.config.generate_lqip,
        )

    def on_page_content(
        self, html: str, page: Page, config: MkDocsConfig, files: Files
    ) -> str:
        """
        Transform page content to use optimized images.

        Replaces img tags with picture elements containing WebP sources
        and lazy loading attributes.
        """
        if not self.config.enabled or not self._transformer:
            return html

        # Get assets base path
        if self._docs_dir:
            assets_base = self._docs_dir

            # Transform images in content
            html = self._transformer.transform(html, assets_base)

        return html

    def on_post_page(
        self, output: str, page: Page, config: MkDocsConfig
    ) -> str:
        """
        Post-process the full HTML output.

        Injects blur-up CSS for LQIP effect.
        """
        if not self.config.enabled or not self._transformer:
            return output

        if self.config.generate_lqip:
            output = self._transformer.inject_blur_up_css(output)

        return output

    def on_post_build(self, config: MkDocsConfig) -> None:
        """
        Final hook after build completes.

        Copies optimized images to the site output directory.
        """
        if not self.config.enabled:
            return

        self._log("Image optimization complete!")

        # Copy optimized images to output
        if self._docs_dir and self._site_dir:
            optimized_dir = self._docs_dir / "assets" / "images" / "optimized"
            if optimized_dir.exists():
                output_dir = self._site_dir / "assets" / "images" / "optimized"
                self._copy_optimized(optimized_dir, output_dir)

    def _create_optimization_config(self) -> OptimizationConfig:
        """Create OptimizationConfig from plugin settings."""
        from .domain.models import ImageFormat, ResponsiveSize

        # Build responsive sizes from config
        responsive_sizes = tuple(
            ResponsiveSize(width=w, suffix=f"-{w}w", quality=self.config.webp_quality)
            for w in self.config.responsive_sizes
        )

        return OptimizationConfig(
            output_formats=(ImageFormat.WEBP,),
            responsive_sizes=responsive_sizes,
            webp_quality=self.config.webp_quality,
            avif_quality=self.config.avif_quality,
            generate_lqip=self.config.generate_lqip,
            lqip_width=self.config.lqip_width,
            max_dimension=self.config.max_dimension,
            skip_patterns=tuple(self.config.skip_patterns),
            enable_lazy_loading=self.config.enable_lazy_loading,
        )

    def _report_results(self) -> None:
        """Report optimization results."""
        if not self._optimization_results:
            return

        successful = sum(1 for r in self._optimization_results if r.success)
        total_savings = sum(r.total_savings_kb for r in self._optimization_results)

        self._log(f"\nOptimization Summary:")
        self._log(f"  Processed: {len(self._optimization_results)} images")
        self._log(f"  Successful: {successful}")
        self._log(f"  Total savings: {total_savings:.1f}KB ({total_savings/1024:.2f}MB)")

        # Report any errors
        for result in self._optimization_results:
            if result.errors:
                self._log(f"  Errors for {result.source.source_path.name}:")
                for error in result.errors:
                    self._log(f"    - {error}")

    def _copy_optimized(self, src: Path, dst: Path) -> None:
        """Copy optimized images to output directory."""
        import shutil

        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
        self._log(f"  Copied optimized images to {dst}")

    def _log(self, message: str, level: str = "info") -> None:
        """Log a message using MkDocs logging."""
        from mkdocs.plugins import get_plugin_logger

        logger = get_plugin_logger(__name__)

        if level == "warning":
            logger.warning(message)
        elif level == "error":
            logger.error(message)
        else:
            logger.info(message)
