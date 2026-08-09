"""
Mobile navigation shell regression tests.

The public site is Home + 404, so a mobile hamburger drawer would be empty
chrome. These checks inspect the built Home page and verify the trigger and
primary drawer links are absent.
"""

import re
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
SITE_ROOT = PROJECT_ROOT / "site"
MOBILE_PAGE = Path("index.html")


def _home_html() -> str:
    page_path = SITE_ROOT / MOBILE_PAGE
    if not page_path.exists():
        raise unittest.SkipTest("Built site is missing; run make build first")
    return page_path.read_text(encoding="utf-8")


class MobileNavShellTest(unittest.TestCase):
    """Regression coverage for the Home-only mobile shell."""

    def test_mobile_hamburger_trigger_is_absent(self):
        html = _home_html()

        self.assertNotIn("mlad-hamburger", html)
        self.assertNotIn('aria-label="Toggle navigation"', html)

    def test_primary_drawer_contains_no_nav_links(self):
        html = _home_html()
        primary_nav = re.search(
            r'<nav\b[^>]*class="[^"]*\bmd-nav--primary\b[^"]*"[^>]*>(.*?)</nav>',
            html,
            flags=re.IGNORECASE | re.DOTALL,
        )

        if not primary_nav:
            return
        self.assertNotRegex(primary_nav.group(1), r'class="[^"]*\bmd-nav__link\b')
