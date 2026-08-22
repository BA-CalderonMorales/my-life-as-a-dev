"""
Root growth capture - screenshots of the landing root system at
rest and at several scroll depths, mobile-standard first.

Every root-art change must regenerate these before review:
    make build && uv run pytest e2e/capture_root_growth.py -v

States captured per viewport:
    rest    - page top, zero root ink expected
    early   - ~500px down, primary sinkers emerging
    mid     - ~1700px down, laterals reaching, feeders starting
    grown   - past the growth envelope, full system settled
"""

import pytest
from pathlib import Path

SCREENSHOT_DIR = Path(__file__).parent.parent / "e2e" / "screenshots" / "root-growth"

VIEWPORTS = [
    ("mobile-standard", {"width": 390, "height": 844}),
    ("desktop", {"width": 1440, "height": 900}),
]

SCROLL_STATES = [
    ("rest", 0),
    ("early", 500),
    ("mid", 1700),
]


def _progress_scroll_y(page, fraction):
    return page.evaluate(
        """
        (fraction) => {
            const root = document.querySelector('[data-life-index]');
            const journey = root.querySelector('[data-life-journey]');
            const stage = root.querySelector('.life-stage');
            const top = journey.getBoundingClientRect().top + window.scrollY;
            const range = journey.offsetHeight - stage.offsetHeight;
            return top + range * fraction;
        }
        """,
        fraction,
    )


@pytest.fixture(scope="module", autouse=True)
def ensure_dir():
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)


@pytest.mark.parametrize("viewport_name,viewport", VIEWPORTS)
def test_capture_root_growth(browser, base_url, http_server, viewport_name, viewport):
    context = browser.new_context(viewport=viewport)
    page = context.new_page()
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    page.wait_for_timeout(600)

    shots = []
    for name, offset in SCROLL_STATES:
        page.evaluate(f"window.scrollTo(0, {offset})")
        page.wait_for_timeout(1600)
        path = SCREENSHOT_DIR / f"roots-{viewport_name}-{name}.png"
        page.screenshot(path=str(path))
        shots.append((name, path))

    grown_y = _progress_scroll_y(page, 0.52)
    page.evaluate(f"window.scrollTo(0, {grown_y})")
    page.wait_for_timeout(1800)
    grown_path = SCREENSHOT_DIR / f"roots-{viewport_name}-grown.png"
    page.screenshot(path=str(grown_path))
    shots.append(("grown", grown_path))

    for name, path in shots:
        print(f"captured {name}: {path}")
    context.close()
