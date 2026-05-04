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
        script = (SITE_ROOT / "assets" / "js" / "version-selector" / "Model.js").read_text(encoding="utf-8")

        self.assertIn("if (Array.isArray(payload)) return payload;", script)
        self.assertIn("if (payload && Array.isArray(payload.versions)) return payload.versions;", script)

    def test_selector_links_preserve_the_current_page_path(self):
        model = (SITE_ROOT / "assets" / "js" / "version-selector" / "Model.js").read_text(encoding="utf-8")
        view = (SITE_ROOT / "assets" / "js" / "version-selector" / "View.js").read_text(encoding="utf-8")

        self.assertIn("pagePath: context.pagePath", model)
        self.assertIn("link.href = item.targetUrl;", view)
        self.assertIn("link.dataset.targetUrl = item.targetUrl;", view)

    def test_selector_dropdown_ships_clickable_opaque_layering(self):
        background_css = (SITE_ROOT / "assets" / "css" / "background.css").read_text(encoding="utf-8")
        view = (SITE_ROOT / "assets" / "js" / "version-selector" / "View.js").read_text(encoding="utf-8")

        self.assertIn(".md-header,\n.md-tabs {", background_css)
        self.assertIn("z-index: 100;", background_css)
        self.assertIn(".md-version__current::after {", background_css)
        self.assertIn("content: none !important;", background_css)
        self.assertIn(".md-version__list {", background_css)
        self.assertIn("pointer-events: none;", background_css)
        self.assertIn(".md-version--active .md-version__list {", background_css)
        self.assertIn("pointer-events: auto;", background_css)
        self.assertIn("this.root.classList.toggle('md-version--active', isOpen);", view)


if __name__ == "__main__":
    unittest.main()
