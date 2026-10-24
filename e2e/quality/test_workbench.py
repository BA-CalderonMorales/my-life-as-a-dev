"""The close-up workbench shares the real experiment state and stays within its section."""
import os
from pathlib import Path

import pytest
from playwright.sync_api import expect


def open_workbench(page, base_url, project="jarvis"):
    errors=[]
    page.on("pageerror",lambda error:errors.append(str(error)))
    page.goto(f"{base_url}/index.html#exhibit-{project}",wait_until="networkidle")
    host=page.locator(".bench-viewport")
    host.scroll_into_view_if_needed()
    expect(host).to_have_attribute("data-bench-state","ready",timeout=15000)
    expect(host).to_have_attribute("data-active-project",project)
    return host,errors


def test_closeup_project_selection_and_keyboard(page,base_url):
    host,errors=open_workbench(page,base_url)
    page.get_by_role("button",name="Pick up agent-harness",exact=True).click()
    expect(host).to_have_attribute("data-active-project","agent")
    expect(page.locator("#exhibit-agent")).to_be_visible()
    host.locator("canvas").focus()
    page.keyboard.press("ArrowRight")
    expect(host).to_have_attribute("data-active-project","algorithm")
    page.get_by_role("button",name="Next comparison",exact=True).click()
    expect(page.locator(".studio-sort-status")).to_contain_text("Comparison 1")
    page.get_by_role("button",name="Turn it ↻",exact=True).click()
    page.get_by_role("button",name="Set it down",exact=True).click()
    assert not errors


def test_terminal_approval_and_notebook_stay_connected(page,base_url):
    host,errors=open_workbench(page,base_url)
    page.get_by_role("button",name="Claude Code",exact=True).click()
    expect(page.locator(".studio-tool-output")).to_contain_text("Claude Code selected")
    page.locator('[data-project="agent"]').click()
    page.get_by_role("button",name="Make a plan",exact=True).click()
    page.get_by_role("button",name="Review the plan",exact=True).click()
    expect(page.locator(".studio-agent-message")).to_contain_text("waits here until you approve")
    page.get_by_role("button",name="Approve this step",exact=True).click()
    page.locator('[data-project="notebook"]').click()
    page.get_by_role("button",name="Leave a star",exact=True).click()
    expect(page.locator(".studio-sketchpad path")).to_have_count(1)
    page.get_by_role("button",name="Pick up the pencil",exact=True).click()
    expect(host).to_have_class("bench-viewport bench-drawing")
    page.get_by_role("button",name="Put the pencil down",exact=True).click()
    expect(host).to_have_class("bench-viewport")
    assert not errors


@pytest.mark.parametrize("width,height",[(390,844),(1440,1000)])
@pytest.mark.parametrize("scheme",["default","slate"])
def test_workbench_layout_and_captures(browser,base_url,width,height,scheme):
    context=browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce")
    page=context.new_page()
    host,errors=open_workbench(page,base_url)
    if scheme=="slate":page.locator('label[for="__palette_1"]').click()
    page.evaluate("document.fonts.ready")
    for key in ["jarvis","agent","algorithm","notebook"]:
        page.locator(f'[data-project="{key}"]').click()
        expect(host).to_have_attribute("data-active-project",key)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        if directory:=os.environ.get("WORKBENCH_SCREENSHOTS"):
            Path(directory).mkdir(parents=True,exist_ok=True)
            page.locator(".studio-projects").screenshot(path=str(Path(directory)/f"bench-{key}-{width}-{scheme}.png"))
    assert not errors
    context.close()


def test_workbench_graphics_failure_keeps_the_experiments(page,base_url):
    page.route("**/studio-workbench/Workbench.js",lambda route:route.abort())
    page.goto(f"{base_url}/index.html#exhibit-algorithm",wait_until="networkidle")
    host=page.locator(".bench-viewport")
    host.scroll_into_view_if_needed()
    expect(host).to_have_attribute("data-bench-state","fallback")
    page.get_by_role("button",name="Next comparison",exact=True).click()
    expect(page.locator(".studio-sort-status")).to_contain_text("Comparison 1")


def test_draw_directly_on_the_open_book(browser,base_url):
    context=browser.new_context(reduced_motion="reduce")
    page=context.new_page()
    host,errors=open_workbench(page,base_url,"notebook")
    page.get_by_role("button",name="Pick up the pencil",exact=True).click()
    guide=page.locator(".bench-pencil-target")
    expect(guide).to_be_visible()
    box=guide.bounding_box()
    x,y=box["x"]+box["width"]/2,box["y"]+box["height"]/2
    page.mouse.move(x,y)
    page.mouse.down()
    page.mouse.move(x+20,y+10,steps=10)
    page.mouse.up()
    expect(page.locator(".studio-sketchpad path")).to_have_count(1)
    assert " L" in page.locator(".studio-sketchpad path").get_attribute("d")
    expect(page.locator(".studio-mark-status")).to_contain_text("isn’t saved or shared")
    page.get_by_role("button",name="Fresh page",exact=True).click()
    expect(guide).to_be_visible()
    assert not errors
    context.close()


def test_set_down_returns_to_the_collection(page,base_url):
    host,errors=open_workbench(page,base_url)
    page.get_by_role("button",name="Set it down",exact=True).click()
    expect(host).to_have_attribute("data-bench-mode","overview")
    expect(host.locator(".bench-object-label:visible")).to_have_count(4)
    page.get_by_role("button",name="Pick up terminal-jarvis",exact=True).click()
    expect(host).to_have_attribute("data-bench-mode","closeup")
    expect(page.locator(".bench-action-hint")).to_contain_text("Click a key")
    expect(host.locator(".bench-object-label:visible")).to_have_count(3)
    assert not errors
