"""The first visit is a real invitation, with a usable way around slow or failed 3D."""
import os
from pathlib import Path

import pytest
from playwright.sync_api import expect

pytestmark = pytest.mark.fresh_visit


@pytest.mark.parametrize("width,height,scheme", [(320, 568, "default"), (390, 844, "slate"), (768, 1024, "default"), (1440, 1000, "default")])
def test_invitation_waits_for_both_scenes_and_enters_without_a_jump(browser, base_url, width, height, scheme):
    context = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce")
    if scheme == "slate":
        context.add_init_script("document.addEventListener('DOMContentLoaded', () => document.body.dataset.mdColorScheme = 'slate')")
    page = context.new_page()
    pending = []
    page.route("**/the-good-stuff-thumb.webp", lambda route: pending.append(route))
    page.goto(f"{base_url}/", wait_until="domcontentloaded")
    dialog = page.get_by_role("dialog")
    expect(dialog).to_be_visible()
    expect(dialog).to_have_attribute("data-arrival-state", "loading")
    expect(dialog.locator(".arrival-enter")).to_be_disabled()
    expect(dialog.locator(".arrival-skip")).to_be_enabled()
    page.wait_for_function("document.querySelector('.bench-viewport').dataset.benchState === 'ready'")
    assert pending
    expect(dialog).to_be_visible()
    pending[0].continue_()
    button = dialog.get_by_role("button", name="Come on in!", exact=True)
    expect(button).to_be_enabled(timeout=20000)
    expect(dialog.locator('[data-arrival-check][data-ready="true"]')).to_have_count(3)
    expect(dialog.locator("h2")).to_have_css("text-transform", "none")
    expect(dialog.locator(".arrival-checks")).to_have_css("display", "flex")
    assert page.evaluate("getComputedStyle(document.querySelector('.arrival-checks')).flexDirection") == "row"
    before = page.evaluate("scrollY")
    assert before == 0
    box = dialog.bounding_box()
    assert box["x"] >= 0 and box["y"] >= 0
    assert abs(box["x"] + box["width"] / 2 - width / 2) < 12
    assert abs(box["y"] + box["height"] / 2 - height / 2) < 12
    assert box["height"] <= height - 30
    if directory := os.environ.get("ARRIVAL_CARD_CAPTURES"):
        Path(directory).mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(Path(directory) / f"welcome-{width}-{scheme}.png"))
    button.click()
    expect(dialog).not_to_be_visible()
    expect(page.locator("#brandon-calderon-morales")).to_be_focused()
    assert page.evaluate("scrollY") == before
    assert page.evaluate("sessionStorage.getItem('studio-entered')") == "1"
    page.reload(wait_until="domcontentloaded")
    expect(dialog).not_to_be_visible()
    assert page.evaluate("!document.documentElement.classList.contains('studio-arrival-pending')")
    context.close()


@pytest.mark.parametrize("exit_method", ["skip", "escape"])
def test_loading_can_be_skipped_with_pointer_or_keyboard(page, base_url, exit_method):
    pending = []
    page.route("**/studio-world/World.js", lambda route: pending.append(route))
    page.goto(f"{base_url}/", wait_until="domcontentloaded")
    dialog = page.get_by_role("dialog")
    expect(dialog).to_be_visible()
    if exit_method == "skip":
        dialog.get_by_role("button", name="Have a look while it loads").click()
    else:
        page.keyboard.press("Escape")
    expect(dialog).not_to_be_visible()
    expect(page.locator("#brandon-calderon-morales")).to_be_focused()
    assert page.evaluate("scrollY") == 0
    for route in pending:
        route.abort()


def test_failed_scenes_still_offer_entry(page, base_url):
    page.route("**/studio-world/World.js", lambda route: route.abort())
    page.route("**/studio-workbench/Workbench.js", lambda route: route.abort())
    page.goto(f"{base_url}/", wait_until="networkidle")
    dialog = page.get_by_role("dialog")
    expect(dialog.get_by_role("button", name="Come on in!", exact=True)).to_be_enabled()
    expect(dialog.locator("#arrival-status")).to_contain_text("plenty to explore")
    dialog.get_by_role("button", name="Come on in!", exact=True).click()
    expect(dialog).not_to_be_visible()
    expect(page.locator('.studio-project-choice[data-project="agent"]')).to_be_visible()


def test_stalled_scene_does_not_trap_the_visitor(page, base_url):
    page.clock.install()
    pending = []
    page.route("**/studio-world/World.js", lambda route: pending.append(route))
    page.goto(f"{base_url}/", wait_until="domcontentloaded")
    dialog = page.get_by_role("dialog")
    expect(dialog).to_be_visible()
    page.clock.fast_forward(16000)
    expect(dialog.get_by_role("button", name="Come on in!", exact=True)).to_be_enabled()
    expect(dialog.locator("#arrival-status")).to_contain_text("taking its time")
    for route in pending:
        route.abort()


def test_project_deep_link_goes_straight_to_the_project(page, base_url):
    page.goto(f"{base_url}/#exhibit-notebook", wait_until="networkidle")
    expect(page.get_by_role("dialog")).not_to_be_visible()
    expect(page.locator('.studio-project-choice[data-project="notebook"]')).to_have_attribute("aria-current", "true")


def test_without_javascript_the_page_has_no_gate(browser, base_url):
    context = browser.new_context(java_script_enabled=False)
    page = context.new_page()
    page.goto(f"{base_url}/", wait_until="networkidle")
    expect(page.locator(".studio-arrival")).not_to_be_visible()
    expect(page.locator("#brandon-calderon-morales")).to_be_visible()
    context.close()


@pytest.mark.parametrize("scheme", ["default", "slate"])
def test_invitation_is_accessible_and_keyboard_operable(page, base_url, scheme):
    from axe_playwright_python.sync_playwright import Axe
    if scheme == "slate":
        page.add_init_script("document.addEventListener('DOMContentLoaded', () => document.body.dataset.mdColorScheme = 'slate')")
    page.goto(f"{base_url}/", wait_until="networkidle")
    dialog = page.get_by_role("dialog")
    button = dialog.get_by_role("button", name="Come on in!", exact=True)
    expect(button).to_be_enabled()
    assert dialog.evaluate("el => el.matches(':modal')")
    report = Axe().run(page, context={"include": [[".studio-arrival"]]})
    violations = report.response.get("violations", [])
    assert not violations, [(v["id"], [(n["html"], n.get("failureSummary")) for n in v["nodes"]]) for v in violations]
    page.keyboard.press("Tab")
    expect(button).to_be_focused()
    page.keyboard.press("Tab")
    expect(button).to_be_focused()
    page.keyboard.press("Enter")
    expect(dialog).not_to_be_visible()


def test_failed_invitation_script_releases_the_page(page, base_url):
    page.clock.install()
    page.route("**/studio-arrival.js", lambda route: route.abort())
    page.goto(f"{base_url}/", wait_until="domcontentloaded")
    page.clock.fast_forward(21000)
    assert page.evaluate("!document.documentElement.classList.contains('studio-arrival-pending')")
    expect(page.locator(".studio-arrival")).not_to_be_visible()
    expect(page.locator("#brandon-calderon-morales")).to_be_visible()


def test_invitation_still_works_when_storage_is_unavailable(page, base_url):
    page.add_init_script("Object.defineProperty(window, 'sessionStorage', {get() {throw new Error('storage unavailable')}})")
    page.goto(f"{base_url}/", wait_until="networkidle")
    dialog = page.get_by_role("dialog")
    dialog.get_by_role("button", name="Come on in!", exact=True).click()
    expect(dialog).not_to_be_visible()
    expect(page.locator("#brandon-calderon-morales")).to_be_focused()
