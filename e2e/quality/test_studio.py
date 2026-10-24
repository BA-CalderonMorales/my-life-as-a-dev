"""Visitor paths through the studio and its browser-local experiments."""
import os
from pathlib import Path

import pytest
from playwright.sync_api import expect


def open_studio(page, base_url, fragment=""):
    page.goto(f"{base_url}/index.html{fragment}", wait_until="networkidle")
    expect(page.locator(".studio-home")).to_have_class("studio-home studio-ready")


def test_project_exploration_and_deep_links(page, base_url):
    open_studio(page, base_url, "#exhibit-algorithm")
    expect(page.locator("#exhibit-algorithm")).to_be_visible()
    for key in ["jarvis", "agent", "algorithm", "notebook"]:
        page.locator(f'[data-project="{key}"]').click()
        expect(page.locator(f"#exhibit-{key}")).to_be_visible()
        assert page.locator(".studio-exhibit:visible").count() == 1
        expect(page.locator(f'[data-project="{key}"]')).to_have_attribute("aria-current", "true")
    expect(page.locator(".studio-discoveries")).to_contain_text("all four")
    assert page.locator('.studio-source[href^="https://github.com/BA-CalderonMorales/"]').count() == 4


def test_tool_picker_and_human_approval(page, base_url):
    open_studio(page, base_url)
    page.get_by_role("button", name="Codex", exact=True).click()
    expect(page.locator(".studio-tool-output")).to_contain_text("Codex selected")
    page.locator('[data-project="agent"]').click()
    page.get_by_role("button", name="Make a plan", exact=True).click()
    page.get_by_role("button", name="Review the plan", exact=True).click()
    expect(page.locator(".studio-agent-message")).to_contain_text("waits here until you approve")
    page.get_by_role("button", name="Ask for a different plan", exact=True).click()
    expect(page.locator(".studio-agent-message")).to_contain_text("Revised plan")
    page.get_by_role("button", name="Review the plan", exact=True).click()
    page.get_by_role("button", name="Approve this step", exact=True).click()
    expect(page.locator(".studio-agent-message")).to_contain_text("Approved")
    page.get_by_role("button", name="Start over", exact=True).click()
    expect(page.locator(".studio-agent-message")).to_contain_text("Help me understand")


def test_sort_finishes_and_stops_when_hidden(browser, base_url):
    context = browser.new_context(reduced_motion="reduce")
    page = context.new_page()
    open_studio(page, base_url, "#exhibit-algorithm")
    page.get_by_role("button", name="Next comparison", exact=True).click()
    expect(page.locator(".studio-sort-status")).to_contain_text("Compare 7 and 3. Swap them.")
    page.get_by_role("button", name="Play it through", exact=True).click()
    expect(page.locator(".studio-sort-status")).to_contain_text("All sorted", timeout=10000)
    assert page.locator(".studio-sort-bars span").all_text_contents() == list("12345678")
    page.get_by_role("button", name="Shuffle", exact=True).click()
    expect(page.get_by_role("button", name="Next comparison", exact=True)).to_be_enabled()
    page.get_by_role("button", name="Play it through", exact=True).click()
    page.locator('[data-project="jarvis"]').click()
    before = page.locator(".studio-sort-status").text_content()
    page.wait_for_timeout(450)
    assert page.locator(".studio-sort-status").text_content() == before
    context.close()


def test_ink_stars_and_freehand(page, base_url):
    open_studio(page, base_url, "#exhibit-notebook")
    page.get_by_role("button", name="Clay", exact=True).click()
    expect(page.get_by_role("button", name="Clay", exact=True)).to_have_attribute("aria-pressed", "true")
    page.get_by_role("button", name="Leave a star", exact=True).click()
    assert page.locator(".studio-sketchpad path").count() == 1
    page.get_by_role("button", name="Fresh page", exact=True).click()
    assert page.locator(".studio-sketchpad path").count() == 0
    pad = page.locator(".studio-sketchpad")
    pad.scroll_into_view_if_needed()
    box = pad.bounding_box()
    page.mouse.move(box["x"] + 30, box["y"] + 45)
    page.mouse.down()
    page.mouse.move(box["x"] + 120, box["y"] + 80, steps=12)
    page.mouse.up()
    assert " L" in page.locator(".studio-sketchpad path").get_attribute("d")
    expect(page.locator(".studio-mark-status")).to_contain_text("isn’t saved or shared")


@pytest.mark.parametrize("scheme", ["default", "slate"])
@pytest.mark.parametrize("width,height", [(320, 800), (390, 844), (768, 1024), (1440, 1000)])
def test_studio_layout_and_captures(browser, base_url, width, height, scheme):
    context = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce")
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    open_studio(page, base_url)
    if scheme == "slate":
        page.locator('label[for="__palette_1"]').click()
    page.evaluate("document.fonts.ready")
    for key in ["jarvis", "agent", "algorithm", "notebook"]:
        page.locator(f'[data-project="{key}"]').click()
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        for button in page.locator(f"#exhibit-{key} button:visible").all():
            box = button.bounding_box()
            assert box["width"] >= 24 and box["height"] >= 24
    assert not errors
    for image in page.locator(".studio-home img:visible").all():
        image.scroll_into_view_if_needed()
        expect(image).to_have_js_property("complete", True)
        assert image.evaluate("el => el.naturalWidth > 0")
    expect(page.get_by_role("link", name="Email me", exact=True)).to_have_attribute("href", "mailto:b.dev.c.m@gmail.com")
    page.locator('[data-project="jarvis"]').click()
    page.evaluate("scrollTo(0,0)")
    if output := os.environ.get("STUDIO_SCREENSHOT_DIR"):
        directory = Path(output)
        directory.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(directory / f"studio-{width}-{scheme}.png"), full_page=True)
    context.close()


def test_studio_keyboard_path(page, base_url):
    open_studio(page, base_url)
    choice = page.locator('[data-project="agent"]')
    choice.focus()
    page.keyboard.press("Enter")
    expect(page.locator("#exhibit-agent")).to_be_visible()
    page.keyboard.press("Tab")
    expect(page.locator('[data-project="algorithm"]')).to_be_focused()
    page.keyboard.press("Enter")
    page.get_by_role("button", name="Next comparison", exact=True).focus()
    page.keyboard.press("Enter")
    expect(page.locator(".studio-sort-status")).to_contain_text("Comparison 1")


def test_content_and_sources_without_javascript(browser, base_url):
    context = browser.new_context(java_script_enabled=False)
    page = context.new_page()
    page.goto(f"{base_url}/index.html")
    assert page.locator(".studio-exhibit:visible").count() == 4
    expect(page.get_by_role("heading", name="Always happy to chat.")).to_be_visible()
    for source in page.locator(".studio-source").all():
        assert source.get_attribute("href").startswith("https://github.com/BA-CalderonMorales/")
    context.close()
