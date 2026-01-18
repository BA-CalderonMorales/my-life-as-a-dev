"""
Presentation Layer - HTML Image Transformer

Transforms HTML output to use optimized images with:
- <picture> elements for format fallback
- srcset for responsive images
- loading="lazy" for below-the-fold images
- decoding="async" for non-blocking decode
- LQIP with blur-up effect

Principles applied:
- Single Responsibility: Only handles HTML transformation
- Open/Closed: Extensible via configuration
"""

from __future__ import annotations

import base64
import re
from pathlib import Path
from typing import NamedTuple


class ImageMatch(NamedTuple):
    """Represents a matched image in HTML."""

    full_match: str
    src: str
    alt: str
    attrs: str


class HTMLImageTransformer:
    """
    Transforms HTML to use optimized images.

    Replaces img tags with picture elements containing:
    - WebP source with srcset for responsive sizes
    - Original format fallback
    - Lazy loading attributes
    - LQIP placeholder with blur-up CSS
    """

    # Pattern to match img tags
    IMG_PATTERN = re.compile(
        r'<img\s+([^>]*?)src=["\']([^"\']+)["\']([^>]*?)/?>', re.IGNORECASE | re.DOTALL
    )

    # Pattern to extract alt attribute
    ALT_PATTERN = re.compile(r'alt=["\']([^"\']*)["\']', re.IGNORECASE)

    def __init__(
        self,
        optimized_dir: str = "optimized",
        enable_lazy: bool = True,
        enable_lqip: bool = True,
        sizes_attr: str = "(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw",
    ) -> None:
        self.optimized_dir = optimized_dir
        self.enable_lazy = enable_lazy
        self.enable_lqip = enable_lqip
        self.sizes_attr = sizes_attr

    def transform(self, html: str, assets_base: Path) -> str:
        """
        Transform all img tags in the HTML to use optimized versions.

        Args:
            html: The HTML content to transform
            assets_base: Base path for resolving asset locations

        Returns:
            Transformed HTML with picture elements
        """

        def replace_img(match: re.Match) -> str:
            return self._transform_image(match, assets_base)

        return self.IMG_PATTERN.sub(replace_img, html)

    def _transform_image(self, match: re.Match, assets_base: Path) -> str:
        """Transform a single img tag."""
        pre_attrs = match.group(1)
        src = match.group(2)
        post_attrs = match.group(3)

        # Skip external images and SVGs
        if src.startswith(("http://", "https://", "data:")) or src.endswith(".svg"):
            return match.group(0)

        # Skip already optimized images
        if self.optimized_dir in src:
            return match.group(0)

        # Extract alt text
        alt_match = self.ALT_PATTERN.search(pre_attrs + post_attrs)
        alt = alt_match.group(1) if alt_match else ""

        # Get the optimized versions
        src_path = Path(src)
        stem = src_path.stem
        parent = src_path.parent
        optimized_base = parent / self.optimized_dir

        # Check for optimized WebP version
        webp_path = optimized_base / f"{stem}.webp"
        webp_exists = self._check_optimized_exists(assets_base, webp_path)

        if not webp_exists:
            # No optimized version, add lazy loading only
            return self._add_lazy_loading(match.group(0))

        # Build srcset for responsive versions
        srcset = self._build_srcset(stem, optimized_base, assets_base)

        # Build picture element
        return self._build_picture_element(
            original_src=src,
            webp_src=str(webp_path),
            srcset=srcset,
            alt=alt,
            pre_attrs=pre_attrs,
            post_attrs=post_attrs,
            assets_base=assets_base,
            stem=stem,
            optimized_base=optimized_base,
        )

    def _check_optimized_exists(self, assets_base: Path, relative_path: Path) -> bool:
        """Check if an optimized file exists."""
        # Handle both absolute and relative paths
        if assets_base.exists():
            full_path = assets_base / relative_path
            return full_path.exists()
        return False

    def _build_srcset(
        self, stem: str, optimized_base: Path, assets_base: Path
    ) -> str | None:
        """Build srcset attribute for responsive images."""
        srcset_entries = []

        # Check for responsive variants
        responsive_suffixes = [
            ("-320w", 320),
            ("-640w", 640),
            ("-1024w", 1024),
            ("-1920w", 1920),
        ]

        for suffix, width in responsive_suffixes:
            variant_path = optimized_base / f"{stem}{suffix}.webp"
            if self._check_optimized_exists(assets_base, variant_path):
                srcset_entries.append(f"{variant_path} {width}w")

        # Add the main optimized image as largest
        main_path = optimized_base / f"{stem}.webp"
        if self._check_optimized_exists(assets_base, main_path):
            # Use a reasonable default width if no responsive variants
            if not srcset_entries:
                srcset_entries.append(f"{main_path}")

        return ", ".join(srcset_entries) if srcset_entries else None

    def _get_lqip_data_uri(
        self, stem: str, optimized_base: Path, assets_base: Path
    ) -> str | None:
        """Get base64 data URI for LQIP."""
        lqip_path = optimized_base / f"{stem}-lqip.webp"
        full_path = assets_base / lqip_path

        if not full_path.exists():
            return None

        try:
            with open(full_path, "rb") as f:
                data = base64.b64encode(f.read()).decode("utf-8")
                return f"data:image/webp;base64,{data}"
        except Exception:
            return None

    def _add_lazy_loading(self, img_tag: str) -> str:
        """Add lazy loading attribute to an img tag."""
        if not self.enable_lazy:
            return img_tag

        # Don't add if already has loading attribute
        if 'loading="' in img_tag or "loading='" in img_tag:
            return img_tag

        # Insert loading="lazy" and decoding="async"
        return img_tag.replace("<img ", '<img loading="lazy" decoding="async" ')

    def _build_picture_element(
        self,
        original_src: str,
        webp_src: str,
        srcset: str | None,
        alt: str,
        pre_attrs: str,
        post_attrs: str,
        assets_base: Path,
        stem: str,
        optimized_base: Path,
    ) -> str:
        """Build a complete picture element with fallbacks."""
        # Get LQIP for blur-up effect
        lqip_uri = None
        if self.enable_lqip:
            lqip_uri = self._get_lqip_data_uri(stem, optimized_base, assets_base)

        # Build lazy loading attributes
        lazy_attrs = ""
        if self.enable_lazy:
            lazy_attrs = 'loading="lazy" decoding="async" '

        # Clean up extra whitespace in attributes
        pre_attrs = pre_attrs.strip()
        post_attrs = post_attrs.strip()

        # Combine other attributes (excluding src and alt which we handle)
        other_attrs = " ".join(
            filter(
                None,
                [
                    pre_attrs,
                    post_attrs,
                ],
            )
        )
        # Remove any existing src, alt, loading, decoding from other_attrs
        other_attrs = re.sub(r'src=["\'][^"\']*["\']', "", other_attrs)
        other_attrs = re.sub(r'alt=["\'][^"\']*["\']', "", other_attrs)
        other_attrs = re.sub(r'loading=["\'][^"\']*["\']', "", other_attrs)
        other_attrs = re.sub(r'decoding=["\'][^"\']*["\']', "", other_attrs)
        other_attrs = " ".join(other_attrs.split())  # Normalize whitespace

        # Build the picture element
        lines = ["<picture>"]

        # WebP source with srcset
        if srcset:
            lines.append(
                f'  <source type="image/webp" srcset="{srcset}" sizes="{self.sizes_attr}">'
            )
        else:
            lines.append(f'  <source type="image/webp" srcset="{webp_src}">')

        # Fallback img (original format)
        img_attrs = [
            f'{lazy_attrs}src="{original_src}"',
            f'alt="{alt}"',
        ]
        if other_attrs:
            img_attrs.append(other_attrs)

        # Add LQIP style if available
        if lqip_uri:
            img_attrs.append(
                f'style="background-image: url({lqip_uri}); '
                f'background-size: cover; transition: filter 0.3s;"'
            )
            img_attrs.append('onload="this.style.filter=\'none\'"')

        lines.append(f"  <img {' '.join(img_attrs)}>")
        lines.append("</picture>")

        return "\n".join(lines)

    def inject_blur_up_css(self, html: str) -> str:
        """
        Inject CSS for blur-up LQIP effect.

        Should be called once per page, adds styles to head.
        """
        blur_css = """
<style>
/* Image optimization: LQIP blur-up effect */
picture img {
  filter: blur(5px);
  transition: filter 0.3s ease-out;
}
picture img[data-loaded="true"],
picture img.loaded {
  filter: none;
}
</style>
"""
        # Insert before </head>
        if "</head>" in html:
            html = html.replace("</head>", f"{blur_css}</head>")

        return html
