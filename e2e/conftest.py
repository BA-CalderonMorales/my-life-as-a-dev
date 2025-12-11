"""
Pytest configuration and shared fixtures for e2e tests.
Uses Playwright for browser automation with uv as the package manager.
"""

import os
import pytest
from pathlib import Path
from playwright.sync_api import sync_playwright, Browser, Page


# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
DOCS_ROOT = PROJECT_ROOT / "docs"
SITE_ROOT = PROJECT_ROOT / "site"

# Runtime config
BASE_URL = os.environ.get("DOCS_BASE_URL", f"file://{SITE_ROOT}")


@pytest.fixture(scope="session")
def browser():
    """Provide a shared browser instance for all tests."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()


@pytest.fixture
def page(browser: Browser):
    """Provide a fresh page for each test."""
    context = browser.new_context()
    page = context.new_page()
    yield page
    context.close()


@pytest.fixture(scope="session")
def base_url():
    """Provide the base URL for site navigation."""
    return BASE_URL


# Page source mappings (mirrors config/pages.js)
PAGE_SOURCES = {
    "home": {
        "name": "Home",
        "source": DOCS_ROOT / "index.md",
        "url": "/index.html",
    },
    "docs_as_code": {
        "name": "Docs as Code",
        "source": DOCS_ROOT / "docs-as-code" / "index.md",
        "url": "/docs-as-code/index.html",
    },
    "learning": {
        "name": "Learning",
        "source": DOCS_ROOT / "learning" / "index.md",
        "url": "/learning/index.html",
    },
    "projects": {
        "name": "Projects",
        "source": DOCS_ROOT / "projects" / "index.md",
        "url": "/projects/index.html",
    },
    "resume": {
        "name": "Resume",
        "source": DOCS_ROOT / "resume" / "index.md",
        "url": "/resume/index.html",
    },
    "error": {
        "name": "404",
        "source": DOCS_ROOT / "404.md",
        "url": "/404.html",
    },
}


@pytest.fixture
def page_sources():
    """Provide page source mappings."""
    return PAGE_SOURCES


@pytest.fixture
def docs_root():
    """Provide docs root path."""
    return DOCS_ROOT


@pytest.fixture
def site_root():
    """Provide site root path."""
    return SITE_ROOT
