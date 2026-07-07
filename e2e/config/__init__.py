"""Config package for e2e tests."""

from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
DOCS_ROOT = PROJECT_ROOT / "docs"
SITE_ROOT = PROJECT_ROOT / "site"

# Page source mappings
PAGE_SOURCES = {
    "home": {
        "name": "Home",
        "source": DOCS_ROOT / "index.md",
        "url": "/index.html",
    },
    "error": {
        "name": "404",
        "source": DOCS_ROOT / "404.md",
        "url": "/404.html",
    },
}

__all__ = ["PAGE_SOURCES", "DOCS_ROOT", "SITE_ROOT", "PROJECT_ROOT"]
