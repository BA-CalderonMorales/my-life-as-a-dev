#!/usr/bin/env python3
"""
Image Optimizer CLI

Standalone command-line interface for optimizing images.
Can be run independently of the MkDocs build.

Usage:
    python -m scripts.python.plugins.image_optimizer.cli [options]

    # Or via make:
    make optimize-images

Examples:
    python -m scripts.python.plugins.image_optimizer.cli
    python -m scripts.python.plugins.image_optimizer.cli --quality 85
    python -m scripts.python.plugins.image_optimizer.cli --dry-run
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path


def main() -> int:
    """Main entry point for the CLI."""
    parser = argparse.ArgumentParser(
        description="Optimize images for web delivery",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    %(prog)s                          # Optimize all images in docs/assets/images
    %(prog)s --quality 85             # Use 85%% quality for WebP
    %(prog)s --dry-run                # Show what would be optimized
    %(prog)s --path custom/images     # Optimize images in custom path
        """,
    )

    parser.add_argument(
        "--path",
        type=str,
        default="docs/assets/images",
        help="Path to images directory (default: docs/assets/images)",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=80,
        help="WebP quality setting 1-100 (default: 80)",
    )
    parser.add_argument(
        "--no-lqip",
        action="store_true",
        help="Disable LQIP generation",
    )
    parser.add_argument(
        "--no-responsive",
        action="store_true",
        help="Disable responsive size generation",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be optimized without making changes",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose output",
    )

    args = parser.parse_args()

    # Check for Pillow
    try:
        from PIL import Image
    except ImportError:
        print("Error: Pillow is required. Install with: pip install Pillow")
        return 1

    # Import our modules
    try:
        from .domain.models import ImageAsset, OptimizationConfig, ResponsiveSize
        from .domain.services import ImageOptimizationService
        from .infrastructure.converters import PillowConverter, PillowLoader
    except ImportError:
        # Handle direct script execution
        from domain.models import ImageAsset, OptimizationConfig, ResponsiveSize
        from domain.services import ImageOptimizationService
        from infrastructure.converters import PillowConverter, PillowLoader

    # Resolve path
    project_root = Path(__file__).parent.parent.parent.parent.parent
    images_dir = project_root / args.path

    if not images_dir.exists():
        print(f"Error: Directory not found: {images_dir}")
        return 1

    print("=" * 60)
    print("Image Optimizer")
    print("=" * 60)
    print(f"Source directory: {images_dir}")
    print(f"WebP quality: {args.quality}")
    print(f"LQIP enabled: {not args.no_lqip}")
    print(f"Responsive sizes: {not args.no_responsive}")
    if args.dry_run:
        print("MODE: DRY RUN (no changes will be made)")
    print("=" * 60)
    print()

    # Configure responsive sizes
    if args.no_responsive:
        responsive_sizes = ()
    else:
        responsive_sizes = (
            ResponsiveSize(width=320, suffix="-320w", quality=75),
            ResponsiveSize(width=640, suffix="-640w", quality=80),
            ResponsiveSize(width=1024, suffix="-1024w", quality=85),
            ResponsiveSize(width=1920, suffix="-1920w", quality=90),
        )

    # Create config
    config = OptimizationConfig(
        webp_quality=args.quality,
        generate_lqip=not args.no_lqip,
        responsive_sizes=responsive_sizes,
    )

    # Create logger
    def log(message: str) -> None:
        if args.verbose or not message.startswith("    "):
            print(message)

    # Dry run mode
    if args.dry_run:
        log("Scanning for images...")
        loader = PillowLoader()

        for ext in ("png", "jpg", "jpeg", "gif"):
            for path in images_dir.rglob(f"*.{ext}"):
                if "optimized" in str(path):
                    continue
                asset = ImageAsset.from_path(path)
                if asset:
                    animated = loader.is_animated(path) if ext == "gif" else False
                    log(
                        f"Would optimize: {asset.relative_path} "
                        f"({asset.size_kb:.1f}KB, animated={animated})"
                    )

        log("\nDry run complete. No files were modified.")
        return 0

    # Create service with dependencies
    loader = PillowLoader()
    converter = PillowConverter(strip_metadata=True)
    service = ImageOptimizationService(
        config=config,
        loader=loader,
        converter=converter,
        logger=log,
    )

    # Scan and optimize
    assets = service.scan_directory(images_dir)

    if not assets:
        print("No images found to optimize.")
        return 0

    print(f"Found {len(assets)} images to process\n")

    # Sort by size (largest first for maximum impact)
    assets.sort(key=lambda a: a.file_size, reverse=True)

    # Optimize all
    results = service.optimize_all(assets)

    # Summary
    successful = sum(1 for r in results if r.success)
    failed = len(results) - successful
    total_savings = sum(r.total_savings_kb for r in results if r.success)

    print()
    print("=" * 60)
    print("OPTIMIZATION COMPLETE")
    print("=" * 60)
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print(f"Total savings: {total_savings:.1f}KB ({total_savings/1024:.2f}MB)")
    print("=" * 60)

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
