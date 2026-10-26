"""Opening the invitation is a short paper reveal, with immediate escape routes."""
import os
from pathlib import Path

import pytest
from playwright.sync_api import expect

pytestmark = pytest.mark.fresh_visit


@pytest.mark.parametrize("width,height,scheme", [
    (320, 568, "default"), (390, 844, "slate"),
    (768, 1024, "default"), (1440, 1000, "default"),
])
def test_entry_opens_paper_then_leaves_a_usable_page(browser, base_url, width, height, scheme):
    context = browser.new_context(viewport={"width": width, "height": height})
    context.add_init_script(f"document.addEventListener('DOMContentLoaded', () => document.body.dataset.mdColorScheme = '{scheme}')")
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(f"{base_url}/", wait_until="networkidle")
    dialog = page.get_by_role("dialog")
    button = dialog.get_by_role("button", name="Come on in!", exact=True)
    expect(button).to_be_enabled()
    page.evaluate("window.entryBefore = {scroll: scrollY, top: document.querySelector('.paper-world-viewport').getBoundingClientRect().top}")
    button.click()
    expect(dialog.locator(".arrival-opening-pages")).to_be_attached()
    assert dialog.evaluate("el => el.matches(':modal')")
    assert page.evaluate("getComputedStyle(document.documentElement).overflowY") == "hidden"
    expect(dialog).to_have_css("opacity", "1")
    expect(dialog.locator(".arrival-card")).to_have_css("opacity", "1")
    # Freeze the actual animation tracks to inspect their intermediate geometry.
    page.evaluate("""() => {
      window.entryTracks = document.querySelector('.studio-arrival').getAnimations({subtree: true});
      entryTracks.forEach(animation => animation.pause());
    }""")
    for time in [160, 460, 820, 1100]:
        page.evaluate("time => entryTracks.forEach(animation => animation.currentTime = time)", time)
        if directory := os.environ.get("ENTRY_MOTION_CAPTURES"):
            Path(directory).mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(Path(directory) / f"entry-{width}-{scheme}-{time}.png"))
    assert page.locator(".arrival-page-left").evaluate("el => getComputedStyle(el).transform") != "none"
    assert page.evaluate("scrollY === entryBefore.scroll")
    page.evaluate("entryTracks.forEach(animation => animation.finish())")
    expect(dialog).not_to_be_visible()
    expect(page.locator("#brandon-calderon-morales")).to_be_focused()
    expect(page.locator(".arrival-opening-pages, .arrival-entry-plane")).to_have_count(0)
    assert page.evaluate("!document.documentElement.classList.contains('studio-arrival-entering')")
    assert page.evaluate("scrollY === entryBefore.scroll")
    assert page.locator(".paper-world-viewport").evaluate("el => getComputedStyle(el).transform") == "none"
    assert page.evaluate("Math.abs(document.querySelector('.paper-world-viewport').getBoundingClientRect().top - entryBefore.top) < 1")
    # A click through the old curtain location must reach the page.
    page.locator('.studio-masthead').get_by_role("link", name="The workbench", exact=True).click()
    expect(page.locator("#building")).to_be_in_viewport()
    assert not errors, errors
    context.close()


@pytest.mark.parametrize("exit_method", ["escape", "reduce-motion", "navigate"])
def test_interrupting_entry_cleans_up_the_modal(page, base_url, exit_method):
    page.goto(f"{base_url}/", wait_until="networkidle")
    page.get_by_role("button", name="Come on in!", exact=True).click()
    expect(page.locator(".arrival-opening-pages")).to_be_attached()
    if exit_method == "escape":
        page.keyboard.press("Escape")
    elif exit_method == "reduce-motion":
        page.emulate_media(reduced_motion="reduce")
    else:
        page.goto(f"{base_url}/#beyond-work", wait_until="domcontentloaded")
    expect(page.get_by_role("dialog")).not_to_be_visible()
    expect(page.locator(".arrival-opening-pages, .arrival-entry-plane")).to_have_count(0)
    assert page.evaluate("!document.documentElement.classList.contains('studio-arrival-entering')")
    assert page.locator(".paper-world-viewport").evaluate("el => getComputedStyle(el).transform") == "none"


def test_entry_finishes_in_real_time_and_ignores_repeat_clicks(page, base_url):
    page.goto(f"{base_url}/", wait_until="networkidle")
    page.get_by_role("button", name="Come on in!", exact=True).click()
    page.locator(".arrival-enter").dispatch_event("click")
    expect(page.locator(".arrival-opening-pages")).to_have_count(1)
    expect(page.get_by_role("dialog")).not_to_be_visible(timeout=2200)
    expect(page.locator(".arrival-opening-pages, .arrival-entry-plane")).to_have_count(0)
    expect(page.locator("#brandon-calderon-morales")).to_be_focused()
    assert page.evaluate("scrollY") == 0


def test_failed_entry_module_never_blocks_the_page(page, base_url):
    page.route("**/studio-arrival/Entry.js", lambda route: route.abort())
    page.goto(f"{base_url}/", wait_until="networkidle")
    page.get_by_role("button", name="Come on in!", exact=True).click()
    expect(page.get_by_role("dialog")).not_to_be_visible()
    expect(page.locator("#brandon-calderon-morales")).to_be_focused()


def test_welcome_can_be_replayed_without_disrupting_deep_links(page, base_url):
    page.add_init_script("sessionStorage.setItem('studio-entered', '1')")
    page.goto(f"{base_url}/?welcome=1", wait_until="networkidle")
    expect(page.get_by_role("dialog")).to_be_visible()
    page.emulate_media(reduced_motion="reduce")
    page.get_by_role("button", name="Come on in!", exact=True).click()
    expect(page.get_by_role("dialog")).not_to_be_visible()
    expect(page.locator(".arrival-opening-pages")).to_have_count(0)
    page.goto(f"{base_url}/?welcome=1#exhibit-notebook", wait_until="networkidle")
    expect(page.get_by_role("dialog")).not_to_be_visible()
    expect(page.locator('.studio-project-choice[data-project="notebook"]')).to_have_attribute("aria-current", "true")
