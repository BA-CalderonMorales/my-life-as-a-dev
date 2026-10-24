"""The paper world is a real local 3D scene, with an HTML path around it."""
import os
from pathlib import Path

import pytest
from playwright.sync_api import expect


def enter_world(page, base_url):
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    world = page.locator(".paper-world-viewport")
    world.scroll_into_view_if_needed()
    expect(world).to_have_attribute("data-world-state", "ready", timeout=20000)
    expect(world.locator("canvas")).to_be_visible()
    return world, errors


def test_world_renders_and_places_open_real_notes(page, base_url):
    world, errors = enter_world(page, base_url)
    for key in ["jarvis", "agent", "algorithm", "notebook"]:
        page.locator(f'.paper-world-marker[data-place="{key}"]').click()
        expect(page.locator(".paper-world-note")).to_be_visible()
        expect(page.locator(f"#exhibit-{key}")).to_be_visible()
    expect(page.locator(".paper-world-progress")).to_have_text("4 / 4 places found")
    page.locator('[data-world-reset]').click()
    expect(page.locator(".paper-world-note")).to_be_hidden()
    assert not errors
    page.locator("[data-world-immersive]").click()
    if directory := os.environ.get("PAPER_WORLD_SCREENSHOTS"):
        Path(directory).mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(Path(directory) / "paper-world-desktop.png"))
        page.screenshot(path=str(Path(directory) / "paper-world-page.png"), full_page=True)


def test_world_keyboard_and_skyline(page, base_url):
    world, errors = enter_world(page, base_url)
    canvas = world.locator("canvas")
    canvas.focus()
    page.keyboard.press("ArrowRight")
    page.keyboard.press("Enter")
    expect(page.locator(".paper-world-note")).to_be_visible()
    page.keyboard.press("Escape")
    expect(page.locator(".paper-world-note")).to_be_hidden()
    page.locator('.paper-world-marker[data-place="algorithm"]').click()
    page.locator('[data-world-sort]').click()
    expect(page.locator(".paper-world-status")).to_contain_text("A little order", timeout=5000)
    assert not errors


@pytest.mark.parametrize("width,height", [(390,844), (768,1024)])
def test_world_mobile_layout(browser, base_url, width, height):
    context = browser.new_context(viewport={"width":width,"height":height}, reduced_motion="reduce", has_touch=True)
    page = context.new_page()
    world, errors = enter_world(page, base_url)
    page.locator('.paper-world-marker[data-place="agent"]').click()
    expect(page.locator(".paper-world-note")).to_be_visible()
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    assert not errors
    page.locator('[data-world-reset]').click()
    if directory := os.environ.get("PAPER_WORLD_SCREENSHOTS"):
        page.evaluate("scrollTo(0,0)")
        page.screenshot(path=str(Path(directory) / f"paper-world-{width}.png"), full_page=True)
    context.close()


def test_world_failure_keeps_the_html_experiments(page, base_url):
    page.route("**/vendor/three/**", lambda route: route.abort())
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    page.locator(".paper-world-viewport").scroll_into_view_if_needed()
    expect(page.locator(".paper-world-viewport")).to_have_attribute("data-world-state","fallback",timeout=10000)
    fallback = page.locator(".paper-world-fallback img")
    expect(fallback).to_be_visible()
    expect(fallback).to_have_js_property("complete", True)
    assert fallback.evaluate("el => el.naturalWidth > 0")
    page.locator('[data-project="algorithm"]').click()
    page.get_by_role("button", name="Next comparison", exact=True).click()
    expect(page.locator(".studio-sort-status")).to_contain_text("Comparison 1")


def test_home_base_returns_without_counting_as_a_project(page, base_url):
    world, errors = enter_world(page, base_url)
    expect(world.locator('.paper-world-marker[data-place="home"]')).to_be_visible()
    page.locator('.paper-world-marker[data-place="jarvis"]').click()
    page.locator('.paper-world-marker[data-place="home"]').click()
    expect(page.locator(".paper-world-note")).to_be_hidden()
    expect(page.locator(".paper-world-status")).to_contain_text("Back at home base")
    expect(page.locator(".paper-world-progress")).to_have_text("1 / 4 places found")
    assert not errors


def test_initial_release_screenshot(browser, base_url):
    context = browser.new_context(viewport={"width":1440,"height":1150}, reduced_motion="reduce")
    page = context.new_page()
    world, errors = enter_world(page, base_url)
    expect(page.locator(".paper-world-progress")).to_have_text("0 / 4 places found")
    expect(world.locator('.paper-world-marker[data-place="home"]')).to_be_visible()
    assert not errors
    if target := os.environ.get("PAPER_WORLD_README_SCREENSHOT"):
        page.evaluate("document.fonts.ready")
        page.evaluate("scrollTo(0,0)")
        Path(target).parent.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=target)
    context.close()


def test_immersive_view_returns_to_the_page_and_notes(page, base_url):
    world, errors = enter_world(page, base_url)
    page.locator('[data-world-immersive]').click()
    expect(page.locator('.paper-world')).to_have_attribute('aria-modal','true')
    expect(world.locator('canvas')).to_be_focused()
    page.keyboard.press('Escape')
    expect(page.locator('.paper-world')).not_to_have_attribute('aria-modal','true')
    page.locator('[data-world-immersive]').click()
    page.locator('.paper-world-marker[data-place="agent"]').click()
    page.locator('[data-world-notes]').click()
    expect(page.locator('.paper-world')).not_to_have_attribute('aria-modal','true')
    expect(page.locator('#exhibit-agent')).to_be_visible()
    assert not errors
