"""Source contracts for the living-index identity."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "docs" / "overrides" / "partials" / "logo.html"
MARK = ROOT / "docs" / "assets" / "images" / "favicon" / "brand-mark.svg"
FAVICON = ROOT / "docs" / "assets" / "images" / "favicon" / "favicon.ico"
MANIFEST = ROOT / "docs" / "manifest.webmanifest"
ASSET_CONFIG = ROOT / "config" / "zensical" / "02-assets.toml"


def test_header_and_favicon_share_the_branch_geometry():
    """The navigation mark and browser mark should use one branch system."""
    logo = LOGO.read_text(encoding="utf-8")
    mark = MARK.read_text(encoding="utf-8")
    geometry = (
        "M32 52V20",
        "M32 37C24 34 19 29 14 21",
        "M32 29C40 26 46 20 50 12",
        "M32 43C40 42 47 38 53 32",
    )

    for path in geometry:
        assert path in logo
        assert path in mark


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
