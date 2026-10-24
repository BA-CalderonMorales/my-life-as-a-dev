"""The notebook's paper, motion preferences, and progressive enhancement survive the studio."""
import os
from pathlib import Path

import pytest
from playwright.sync_api import expect


@pytest.mark.parametrize("scheme", ["default", "slate"])
@pytest.mark.parametrize("width,height", [(390, 844), (768, 1024), (1440, 900)])
def test_notebook_reduced_motion(browser, base_url, scheme, width, height):
    context = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce")
    page = context.new_page()
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    if scheme == "slate":
        page.locator('label[for="__palette_1"]').click()
    expect(page.locator("body")).to_have_attribute("data-md-color-scheme", scheme)
    page.locator('[data-project="algorithm"]').click()
    page.get_by_role("button", name="Next comparison", exact=True).click()
    assert page.locator(".studio-sort-bars span").evaluate_all("""elements => elements.every(el =>
        getComputedStyle(el).transitionDuration === '0s' && getComputedStyle(el).animationName === 'none')""")
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    page.get_by_role("link", name="Email me", exact=True).click(trial=True)
    page.evaluate("scrollTo(0, 0)")
    if output := os.environ.get("NOTEBOOK_SCREENSHOT_DIR"):
        directory = Path(output)
        directory.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(directory / f"home-{width}-{scheme}.png"), full_page=True)
    context.close()


def test_no_ambient_animation_runs_forever(page, base_url):
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    infinite = page.locator(".studio-home, .studio-home *").evaluate_all("""elements => elements.filter(el =>
        getComputedStyle(el).display !== 'none' && getComputedStyle(el).animationIterationCount === 'infinite').length""")
    assert infinite == 0
