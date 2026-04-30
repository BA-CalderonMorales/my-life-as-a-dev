"""
Pytest configuration and shared fixtures for e2e tests.
Uses Playwright for browser automation with uv as the package manager.
"""

import os
import pytest
import threading
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    from playwright.sync_api import Browser, Page
else:
    Browser = Any
    Page = Any


# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
DOCS_ROOT = PROJECT_ROOT / "docs"
SITE_ROOT = PROJECT_ROOT / "site"


def find_free_port():
    """Find a free port to use for the HTTP server."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]


class QuietHTTPRequestHandler(SimpleHTTPRequestHandler):
    """HTTP request handler that doesn't log requests."""
    def log_message(self, format, *args):
        pass  # Suppress logging


@pytest.fixture(scope="session")
def http_server():
    """Start a simple HTTP server for the built site."""
    port = find_free_port()
    
    # Create handler that serves from site directory
    handler = lambda *args, **kwargs: QuietHTTPRequestHandler(
        *args, directory=str(SITE_ROOT), **kwargs
    )
    
    server = HTTPServer(('localhost', port), handler)
    thread = threading.Thread(target=server.serve_forever)
    thread.daemon = True
    thread.start()
    
    yield f"http://localhost:{port}"
    
    server.shutdown()


@pytest.fixture(scope="session")
def browser():
    """Provide a shared browser instance for all tests."""
    try:
        from playwright.sync_api import sync_playwright
    except ModuleNotFoundError:
        pytest.skip("Playwright is not installed in this environment")

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True)
        except Exception as exc:
            pytest.exit(
                "Playwright Chromium could not start. Run "
                "`make browser-install`, or `make browser-install-deps` if Linux/WSL "
                f"system libraries are missing. Original error: {exc}",
                returncode=2,
            )
        yield browser
        browser.close()


@pytest.fixture
def page(browser: Browser):
    """Provide a fresh page for each test."""
    context = browser.new_context()
    page = context.new_page()
    yield page
    context.close()


# Runtime config - prefer HTTP server, fall back to env var or file://
@pytest.fixture(scope="session")
def base_url(http_server):
    """Provide the base URL for site navigation (uses HTTP server)."""
    return os.environ.get("DOCS_BASE_URL", http_server)


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
