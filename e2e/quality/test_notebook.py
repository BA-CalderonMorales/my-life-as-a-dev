"""Check notebook ink, optional captures, and motion preferences.

Capture settled pages with NOTEBOOK_SCREENSHOT_DIR=/tmp/notebook-preview
uv run pytest e2e/quality/test_notebook.py.
"""

import os
import re
from pathlib import Path

import pytest
from playwright.sync_api import expect


@pytest.mark.parametrize("scheme", ["default", "slate"])
@pytest.mark.parametrize("width,height", [(390, 844), (768, 1024), (1440, 900)])
def test_notebook_reduced_motion(browser, base_url, scheme, width, height):
    """Every drawing remains visible and still, including after it is scheduled."""
    context = browser.new_context(
        viewport={"width": width, "height": height}, reduced_motion="reduce"
    )
    page = context.new_page()
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    if scheme == "slate":
        page.locator('label[for="__palette_1"]').click()
    expect(page.locator("body")).to_have_attribute("data-md-color-scheme", scheme)
    page.evaluate("document.fonts.ready")

    # Exercise the delayed .drawn selector as well as the initial CSS state.
    for doodle in page.locator(".doodle").all():
        if doodle.is_visible():
            doodle.scroll_into_view_if_needed()
    page.mouse.move(0, 0)
    page.wait_for_timeout(4500)
    assert page.locator(".doodle.drawn").count() > 0
    animated_paths = page.locator(".doodle path").evaluate_all("""paths =>
        paths.filter(path => {
            const style = getComputedStyle(path);
            return style.animationName !== 'none'
                || style.transitionDuration !== '0s'
                || parseFloat(style.strokeDashoffset) !== 0;
        }).length
    """)
    assert animated_paths == 0, "Reduced motion must override scheduled strokes"
    assert page.evaluate(
        "document.documentElement.scrollWidth <= document.documentElement.clientWidth"
    )
    page.get_by_role("link", name="Email me", exact=True).click(trial=True)
    page.evaluate("window.scrollTo(0, 0)")

    if output := os.environ.get("NOTEBOOK_SCREENSHOT_DIR"):
        directory = Path(output)
        directory.mkdir(parents=True, exist_ok=True)
        palette = "light" if scheme == "default" else "dark"
        page.screenshot(path=str(directory / f"home-{width}-{palette}.png"), full_page=True)
    context.close()


def test_notebook_eraser_and_settled_motion(page, base_url):
    """The original eraser still redraws; idle drawings no longer loop forever."""
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    underline = page.locator(".doodle-underline")
    expect(underline).to_have_class(re.compile(r"\bdrawn\b"))
    underline.hover()
    expect(underline).to_have_class(re.compile(r"\berased\b"))
    page.mouse.move(0, 0)
    expect(underline).not_to_have_class(re.compile(r"\berased\b"))
    expect(underline).to_have_class(re.compile(r"\bdoodle-slow\b"))
    infinite = page.locator(".doodle, .doodle path").evaluate_all("""elements =>
        elements.filter(el => getComputedStyle(el).animationIterationCount === 'infinite').length
    """)
    assert infinite == 0


def test_marker_draws_one_continuous_stroke_at_a_time(page, base_url):
    """Ink grows along one connected path, with a tip at its advancing end."""
    page.goto(f"{base_url}/index.html", wait_until="domcontentloaded")
    path = page.locator(".doodle-underline path")
    page.wait_for_function("""() => {
        const path = document.querySelector('.doodle-underline path');
        if (!path) return false;
        const offset = parseFloat(getComputedStyle(path).strokeDashoffset);
        return offset > 0.3 && offset < 0.9;
    }""")
    before = path.evaluate("el => parseFloat(getComputedStyle(el).strokeDashoffset)")
    page.wait_for_timeout(250)
    after = path.evaluate("el => parseFloat(getComputedStyle(el).strokeDashoffset)")
    assert 0 < after < before < 1, "Ink must advance visibly, not appear all at once"
    assert page.locator(".doodle.drawing").count() == 1
    assert page.locator(".doodle:not(.drawn):not(.drawing)").count() > 0
    broken_strokes = page.locator(".doodle").evaluate_all("""drawings =>
        drawings.filter(svg => {
            const paths = svg.querySelectorAll('path');
            return paths.length !== 1 || (paths[0].getAttribute('d').match(/[Mm]/g) || []).length !== 1;
        }).length
    """)
    assert broken_strokes == 0, "Every drawing must have exactly one pen-down point"
    tip_error = page.locator(".doodle-underline").evaluate("""svg => {
        const path = svg.querySelector('path');
        const tip = svg.querySelector('circle');
        const progress = 1 - parseFloat(getComputedStyle(path).strokeDashoffset);
        const point = path.getPointAtLength(path.getTotalLength() * progress);
        return Math.hypot(point.x - tip.cx.baseVal.value, point.y - tip.cy.baseVal.value);
    }""")
    assert tip_error < 0.1
