"""Source contracts for the living-index identity."""

import json
import math
import re
from pathlib import Path

from scripts.python import generate_life_tree, patch_life_tree


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "docs" / "index.md"
LOGO = ROOT / "docs" / "overrides" / "partials" / "logo.html"
MARK = ROOT / "docs" / "assets" / "images" / "favicon" / "brand-mark.svg"
FAVICON = ROOT / "docs" / "assets" / "images" / "favicon" / "favicon.ico"
MANIFEST = ROOT / "docs" / "manifest.webmanifest"
ASSET_CONFIG = ROOT / "config" / "zensical" / "02-assets.toml"
FACETS = ("work", "make", "serve", "learn", "life")
BRAND_PATHS = (
    "M32 52V20",
    "M32 37C24 34 19 29 14 21",
    "M32 29C40 26 46 20 50 12",
    "M32 43C40 42 47 38 53 32",
)


def test_header_and_favicon_share_the_branch_geometry():
    """The navigation mark and browser mark should use one branch system."""
    logo = LOGO.read_text(encoding="utf-8")
    mark = MARK.read_text(encoding="utf-8")
    assert re.findall(r'<path d="([^"]+)"', logo) == list(BRAND_PATHS)
    assert re.findall(r'<path d="([^"]+)"', mark) == list(BRAND_PATHS)


def test_favicon_is_a_real_icon_container():
    """The configured favicon should be a binary ICO, not encoded text."""
    assert FAVICON.read_bytes().startswith(b"\x00\x00\x01\x00")


def test_manifest_uses_the_public_identity():
    """Install metadata should match the portfolio name and palette."""
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    assert manifest["name"] == "Brandon A. Calderon Morales"
    assert manifest["short_name"] == "Brandon"
    assert manifest["background_color"] == "#f3f0e8"


def test_living_index_script_is_shipped_by_zensical():
    """The interaction module should be registered in modular config."""
    config = ASSET_CONFIG.read_text(encoding="utf-8")

    assert '"assets/js/living-index.js"' in config
    assert '"assets/js/life-tree.js"' in config
    assert '"assets/css/life-tree.css"' in config


def test_life_tree_generator_is_deterministic_and_finite():
    """The fixed seed should always produce the same valid SVG fragment."""
    first = generate_life_tree.build()
    second = generate_life_tree.build()

    assert first == second
    assert generate_life_tree.validate(first)
    assert "nan" not in first.lower()
    assert "inf" not in first.lower()

    for token in re.findall(r"-?\d+(?:\.\d+)?", first):
        assert math.isfinite(float(token))


def test_life_tree_geometry_and_semantic_layers_are_separate():
    """One grown silhouette should sit behind five semantic hit paths."""
    markup = generate_life_tree.build()
    wood = re.search(
        r'<path class="life-tree__wood-shape" d="([^"]+)"', markup
    )

    assert wood is not None
    assert len(re.findall(r"(?:^|\s)M\s", wood.group(1))) == 1
    assert re.findall(r'data-tree-branch="([^"]+)"', markup) == list(FACETS)
    assert re.findall(r'data-tree-node="([^"]+)"', markup) == list(FACETS)
    assert markup.count('class="life-tree__wood-shape"') == 1
    assert markup.count('class="life-tree__branch-hit"') == 5
    assert markup.count('class="life-tree__roots"') == 1
    assert markup.count('class="life-tree__canopy-shape"') == 1
    assert markup.index('class="life-tree__roots"') < markup.index(
        'class="life-tree__breeze"'
    )
    assert markup.index('class="life-tree__wood"') < markup.index(
        'class="life-tree__breeze"'
    )
    assert markup.index('class="life-tree__limbs"') > markup.index(
        'class="life-tree__breeze"'
    )


def test_generated_homepage_keeps_every_tree_and_dossier_target():
    """Generated markup should preserve the public interaction contract."""
    index = INDEX.read_text(encoding="utf-8")

    assert re.findall(r'data-tree-branch="([^"]+)"', index) == list(FACETS)
    assert re.findall(r'data-tree-node="([^"]+)"', index) == list(FACETS)
    assert re.findall(r'data-life-target="([^"]+)"', index) == list(FACETS)
    assert re.findall(r'data-life-panel="([^"]+)"', index) == list(FACETS)
    for facet in FACETS:
        assert f'id="{facet}"' in index


def test_life_tree_patcher_is_idempotent():
    """Regenerating twice must not add indentation or change the page again."""
    source = INDEX.read_text(encoding="utf-8")
    generated = generate_life_tree.build()
    once = patch_life_tree.patch_text(source, generated)
    twice = patch_life_tree.patch_text(once, generated)

    assert twice == once
