"""
Visual regression test — capture screenshots of all key pages
across viewports (mobile, tablet, desktop) and color schemes.
"""

import pytest
from pathlib import Path

SCREENSHOT_DIR = Path(__file__).parent.parent / "e2e" / "screenshots"

PAGES = [
    ("/index.html", "home"),
    ("/404/", "404"),
]

VIEWPORTS = [
    ("mobile", {"width": 390, "height": 844}),
    ("tablet", {"width": 768, "height": 1024}),
    ("desktop", {"width": 1440, "height": 900}),
]

SCHEMES = [
    ("light", "default"),
    ("dark", "slate"),
]


def _set_color_scheme(page, scheme: str):
    """Set MkDocs Material color scheme via localStorage + reload."""
    page.evaluate(f"""
        localStorage.setItem('/.__palette', JSON.stringify({{index: {'0' if scheme == 'slate' else '1'}}}));
    """)
    page.reload(wait_until="networkidle")
    # Wait for fonts, layout, and the self-drawing doodles to settle
    # (the slowest stroke finishes ~6.5s after it enters view).
    page.wait_for_timeout(7000)


def _let_doodles_finish(page):
    """Walk the page like a reader so every doodle has drawn itself."""
    page.evaluate("""
        async () => {
            const step = window.innerHeight / 2;
            for (let y = 0; y <= document.body.scrollHeight; y += step) {
                window.scrollTo(0, y);
                await new Promise((resolve) => setTimeout(resolve, 250));
            }
            window.scrollTo(0, 0);
        }
    """)
    # The slowest doodle finishes ~6.2s after it enters view.
    page.wait_for_timeout(6500)


@pytest.fixture(scope="session", autouse=True)
def ensure_screenshot_dir():
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)


@pytest.mark.parametrize("url_path,name", PAGES)
@pytest.mark.parametrize("viewport_name,viewport", VIEWPORTS)
@pytest.mark.parametrize("scheme_name,scheme", SCHEMES)
def test_screenshot(browser, base_url, url_path, name, viewport_name, viewport, scheme_name, scheme):
    context = browser.new_context(viewport=viewport)
    page = context.new_page()
    page.goto(f"{base_url}{url_path}", wait_until="networkidle")
    page.wait_for_timeout(500)
    _set_color_scheme(page, scheme)
    _let_doodles_finish(page)

    screenshot_path = SCREENSHOT_DIR / f"{name}-{viewport_name}-{scheme_name}.png"
    page.screenshot(path=str(screenshot_path), full_page=True)
    print(f"Saved: {screenshot_path}")
    context.close()
