"""
Version selector regression checks.

These tests validate the shipped assets after `make build` so version-selector
behavior does not silently regress when global theme layering changes.
"""

import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
SITE_ROOT = PROJECT_ROOT / "site"


class VersionSelectorRegressionTest(unittest.TestCase):
    """Contract checks for the built version selector assets."""

    def test_selector_handles_array_and_wrapped_versions_manifests(self):
        script = (SITE_ROOT / "assets" / "js" / "version-selector.js").read_text(encoding="utf-8")

        self.assertIn("if (Array.isArray(payload)) return payload;", script)
        self.assertIn("if (payload && Array.isArray(payload.versions)) return payload.versions;", script)

    def test_selector_links_always_have_valid_version_root_fallbacks(self):
        script = (SITE_ROOT / "assets" / "js" / "version-selector.js").read_text(encoding="utf-8")

        self.assertIn("a.href = fallbackUrl;", script)
        self.assertIn("a.dataset.targetUrl = targetUrl;", script)
        self.assertIn("window.location.assign(targetUrl);", script)
        self.assertIn("window.location.assign(fallbackUrl);", script)

    def test_selector_dropdown_ships_clickable_opaque_layering(self):
        background_css = (SITE_ROOT / "assets" / "css" / "background.css").read_text(encoding="utf-8")
        script = (SITE_ROOT / "assets" / "js" / "version-selector.js").read_text(encoding="utf-8")

        self.assertIn(".md-header,\n.md-tabs {", background_css)
        self.assertIn("z-index: 20;", background_css)
        self.assertIn(".md-version__list {", background_css)
        self.assertIn("pointer-events: none;", background_css)
        self.assertIn(".md-version--active .md-version__list {", background_css)
        self.assertIn("pointer-events: auto;", background_css)
        self.assertIn("background: var(--mlad-surface-solid", script)


if __name__ == "__main__":
    unittest.main()
