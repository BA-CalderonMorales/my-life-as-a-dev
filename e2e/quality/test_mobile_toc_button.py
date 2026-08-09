"""
Mobile table-of-contents regression tests.

The public surface is Home + 404. Material may emit secondary sidebar markup,
but it must stay hidden by default for the landing shell.
"""

import re
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
SITE_ROOT = PROJECT_ROOT / "site"
PUBLIC_PAGES = (Path("index.html"), Path("404/index.html"))


def _page_html(path: Path) -> str:
    page_path = SITE_ROOT / path
    if not page_path.exists():
        raise unittest.SkipTest("Built site is missing; run make build first")
    return page_path.read_text(encoding="utf-8")


class MobileTocButtonTest(unittest.TestCase):
    """Regression coverage for the Home + 404 public shell."""

    def test_public_pages_keep_secondary_toc_hidden(self):
        for path in PUBLIC_PAGES:
            with self.subTest(path=str(path)):
                html = _page_html(path)
                secondary_sidebar = re.search(
                    r'<div\b[^>]*class="[^"]*\bmd-sidebar--secondary\b[^"]*"[^>]*>',
                    html,
                    flags=re.IGNORECASE,
                )
                if secondary_sidebar:
                    self.assertIn("hidden", secondary_sidebar.group(0))
