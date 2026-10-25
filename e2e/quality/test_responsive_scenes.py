"""Readable 3D objects, touch gestures, and selection without page jumps."""
import os
from pathlib import Path

import pytest
from playwright.sync_api import expect

PROJECTS = ["jarvis", "agent", "algorithm", "notebook"]


def observe_scenes(page):
    """Expose scene geometry only in the test browser, never in shipped code."""
    for module, key in [("studio-world/World.js", "world"), ("studio-workbench/Workbench.js", "bench")]:
        def handler(scene_key):
            def expose(route):
                response = route.fetch()
                body = response.text().replace("init() {", f"init() {{ window.__{scene_key} = this;", 1)
                route.fulfill(response=response, body=body)
            return expose
        page.route(f"**/{module}", handler(key))


def settle(page, key):
    page.wait_for_function("""key => {
      const s = window['__' + key];
      if (!s || Math.abs(s.viewSpan - s.spanTarget) > .02 || s.focus.distanceTo(s.focusTarget) > .02) return false;
      if (key === 'world') return s.world.plane.position.distanceTo(s.target) < .02;
      return [...s.objects].every(([id, a]) => a.group.position.distanceTo(s.targets.get(id).position) < .02);
    }""", arg=key)


def capture(page, selector, name):
    if directory := os.environ.get("RESPONSIVE_SCENE_CAPTURES"):
        Path(directory).mkdir(parents=True, exist_ok=True)
        page.locator(selector).screenshot(path=str(Path(directory) / name))


def projected_size(page, key):
    return page.evaluate("""async key => {
      const {Box3, Vector3} = await import('./assets/vendor/three/three.module.min.js');
      const s = window['__' + key];
      const group = key === 'world' ? s.world.stations.get(s.selected) : s.objects.get(s.selection).group;
      const bounds = new Box3().setFromObject(group), points=[];
      for (const x of [bounds.min.x,bounds.max.x])
        for (const y of [bounds.min.y,bounds.max.y])
          for (const z of [bounds.min.z,bounds.max.z]) points.push(new Vector3(x,y,z).project(s.camera));
      const rect=s.renderer.domElement.getBoundingClientRect();
      const minX=Math.min(...points.map(p=>p.x)), maxX=Math.max(...points.map(p=>p.x));
      return {width:(maxX-minX)*rect.width/2,canvasWidth:rect.width,
        aspect:rect.width/rect.height,frustumAspect:(s.camera.right-s.camera.left)/(s.camera.top-s.camera.bottom)};
    }""", key)


@pytest.mark.parametrize("width,height", [(320,740), (390,844), (768,1024), (1024,768), (1366,1024)])
@pytest.mark.parametrize("scheme", ["default", "slate"])
def test_touch_objects_are_readable_and_controls_are_separate(browser, base_url, width, height, scheme):
    context = browser.new_context(viewport={"width":width,"height":height}, has_touch=True, reduced_motion="reduce", device_scale_factor=2)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    observe_scenes(page)
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    if scheme == "slate":
        page.locator('label[for="__palette_1"]').click()
    world = page.locator(".paper-world-viewport")
    world.scroll_into_view_if_needed()
    expect(world).to_have_attribute("data-world-state", "ready", timeout=20000)
    capture(page, ".paper-world", f"world-home-{width}-{scheme}.png")
    markers = page.locator(".paper-world-marker")
    for i in range(markers.count()):
        assert markers.nth(i).bounding_box()["height"] >= 44
    for project in PROJECTS:
        page.locator(f'.paper-world-marker[data-place="{project}"]').tap()
        expect(world).to_have_attribute("data-world-view", "closeup")
        settle(page, "world")
        metrics = projected_size(page, "world")
        assert metrics["width"] >= min(175, metrics["canvasWidth"] * .44)
        assert abs(metrics["aspect"] - metrics["frustumAspect"]) < .01
        note = page.locator(".paper-world-note").bounding_box()
        canvas = world.locator("canvas").bounding_box()
        assert note["y"] >= canvas["y"] + canvas["height"]
        capture(page, ".paper-world", f"world-{project}-{width}-{scheme}.png")
    page.locator('.paper-world-marker[data-place="home"]').tap()
    expect(world).to_have_attribute("data-world-view", "overview")
    host = page.locator(".bench-viewport")
    host.scroll_into_view_if_needed()
    expect(host).to_have_attribute("data-bench-state", "ready", timeout=20000)
    for project in PROJECTS:
        choice = page.locator(f'[data-project="{project}"]')
        choice.scroll_into_view_if_needed()
        choice.evaluate("""el => el.addEventListener('pointerdown', () => {
          window.selectionScrollY = scrollY;
        }, {once:true, capture:true})""")
        choice.tap()
        expect(host).to_have_attribute("data-active-project", project)
        before = page.evaluate("window.selectionScrollY")
        assert before is not None
        assert abs(page.evaluate("scrollY") - before) <= 2
        host.scroll_into_view_if_needed()
        settle(page, "bench")
        metrics = projected_size(page, "bench")
        assert metrics["width"] >= min(200, metrics["canvasWidth"] * .55)
        assert metrics["width"] <= metrics["canvasWidth"] * 1.03
        assert abs(metrics["aspect"] - metrics["frustumAspect"]) < .01
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        capture(page, ".studio-projects", f"bench-{project}-{width}-{scheme}.png")
    page.locator('[data-bench-reset]').tap()
    host.scroll_into_view_if_needed()
    settle(page, "bench")
    buttons = host.locator(".bench-object-label:visible")
    expect(buttons).to_have_count(4)
    canvas = host.locator("canvas").bounding_box()
    for i in range(4):
        box = buttons.nth(i).bounding_box()
        assert box["height"] >= 44
        assert box["y"] >= canvas["y"] + canvas["height"]
    capture(page, ".studio-projects", f"bench-overview-{width}-{scheme}.png")
    buttons.first.tap()
    expect(host).to_have_attribute("data-active-project", "jarvis")
    assert not errors
    context.close()


@pytest.mark.parametrize("width,height", [(390,844), (768,1024), (1440,1000)])
def test_switching_and_keyboard_preserve_position(browser, base_url, width, height):
    context = browser.new_context(viewport={"width":width,"height":height}, has_touch=width<1100)
    page = context.new_page()
    observe_scenes(page)
    page.goto(f"{base_url}/index.html#exhibit-jarvis", wait_until="networkidle")
    host = page.locator(".bench-viewport")
    host.scroll_into_view_if_needed()
    expect(host).to_have_attribute("data-bench-state", "ready", timeout=20000)
    height_before = page.locator(".studio-bench").bounding_box()["height"]
    for project in ["agent", "notebook", "algorithm", "jarvis"]:
        choice = page.locator(f'[data-project="{project}"]')
        choice.scroll_into_view_if_needed()
        choice.evaluate("el => el.focus({preventScroll:true})")
        before = page.evaluate("scrollY")
        page.keyboard.press("Enter")
        expect(host).to_have_attribute("data-active-project", project)
        expect(choice).to_be_focused()
        page.wait_for_timeout(180)
        assert abs(page.evaluate("scrollY") - before) <= 2
        assert abs(page.locator(".studio-bench").bounding_box()["height"] - height_before) <= 2
    host.scroll_into_view_if_needed()
    host.locator("canvas").evaluate("el => el.focus({preventScroll:true})")
    before = page.evaluate("scrollY")
    for _ in range(8):
        page.keyboard.press("ArrowRight")
    page.wait_for_timeout(700)
    assert abs(page.evaluate("scrollY") - before) <= 2
    expect(host.locator("canvas")).to_be_focused()
    settle(page, "bench")
    context.close()


def swipe(page, canvas, dx, dy):
    canvas.evaluate("el => el.scrollIntoView({block:'center',behavior:'instant'})")
    rect = canvas.bounding_box()
    x, y = rect["x"] + rect["width"] / 2, rect["y"] + rect["height"] / 2
    before = page.evaluate("scrollY")
    session = page.context.new_cdp_session(page)
    session.send("Input.dispatchTouchEvent", {"type":"touchStart", "touchPoints":[{"x":x,"y":y}]})
    for i in range(1, 9):
        session.send("Input.dispatchTouchEvent", {"type":"touchMove", "touchPoints":[{"x":x+dx*i/8,"y":y+dy*i/8}]})
        page.wait_for_timeout(20)
    session.send("Input.dispatchTouchEvent", {"type":"touchEnd", "touchPoints":[]})
    session.detach()
    page.wait_for_timeout(150)
    return page.evaluate("scrollY") - before


def test_touch_scroll_rotation_drawing_and_orientation(browser, base_url):
    context = browser.new_context(viewport={"width":390,"height":844}, has_touch=True, reduced_motion="reduce")
    page = context.new_page()
    observe_scenes(page)
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    world = page.locator(".paper-world-viewport")
    world.scroll_into_view_if_needed()
    expect(world).to_have_attribute("data-world-state", "ready", timeout=20000)
    for key, selector, target in [("world", ".paper-world-viewport canvas", "targetYaw"), ("bench", ".bench-viewport canvas", "inspectTarget")]:
        page.locator(".paper-world-viewport" if key == "world" else ".bench-viewport").scroll_into_view_if_needed()
        page.wait_for_function("key => window['__'+key]?.renderer", arg=key)
        yaw = page.evaluate(f"window.__{key}.{target}")
        assert swipe(page, page.locator(selector), 0, -100) > 10
        assert page.evaluate(f"window.__{key}.{target}") == yaw
        assert abs(swipe(page, page.locator(selector), 70, 0)) <= 2
        assert abs(page.evaluate(f"window.__{key}.{target}") - yaw) > .1
    page.locator('[data-project="notebook"]').tap()
    page.locator('[data-bench-draw]').tap()
    host = page.locator(".bench-viewport")
    host.scroll_into_view_if_needed()
    settle(page, "bench")
    guide = page.locator(".bench-pencil-target")
    expect(guide).to_be_visible()
    swipe(page, guide, 25, 10)
    expect(page.locator(".studio-sketchpad path")).to_have_count(1)
    page.set_viewport_size({"width":844,"height":390})
    host.scroll_into_view_if_needed()
    settle(page, "bench")
    metrics = projected_size(page, "bench")
    assert abs(metrics["aspect"] - metrics["frustumAspect"]) < .01
    assert metrics["width"] <= metrics["canvasWidth"] * 1.03
    context.close()


def test_agent_review_focus_does_not_move_the_desktop_page(page, base_url):
    observe_scenes(page)
    page.goto(f"{base_url}/index.html#exhibit-agent", wait_until="networkidle")
    page.locator(".bench-viewport").scroll_into_view_if_needed()
    expect(page.locator(".bench-viewport")).to_have_attribute("data-bench-state", "ready", timeout=20000)
    page.locator('[data-agent-next]').click()
    page.locator('[data-agent-next]').click()
    page.locator(".bench-viewport").scroll_into_view_if_needed()
    settle(page, "bench")
    point = page.evaluate("""async () => {
      const {Vector3}=await import('./assets/vendor/three/three.module.min.js');
      const s=window.__bench, p=new Vector3(0,.4,0).applyMatrix4(s.objects.get('agent').group.matrixWorld).project(s.camera);
      const r=s.renderer.domElement.getBoundingClientRect();
      return {x:r.x+(p.x+1)*r.width/2,y:r.y+(1-p.y)*r.height/2};
    }""")
    before = page.evaluate("scrollY")
    page.mouse.click(point["x"], point["y"])
    expect(page.locator('[data-agent-next]')).to_be_focused()
    assert abs(page.evaluate("scrollY") - before) <= 2


@pytest.mark.parametrize("width,height", [(390,844), (844,390)])
def test_touch_immersive_controls_leave_room_for_the_scene(browser, base_url, width, height):
    context = browser.new_context(viewport={"width":width,"height":height}, has_touch=True, reduced_motion="reduce")
    page = context.new_page()
    observe_scenes(page)
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    host = page.locator(".paper-world-viewport")
    host.scroll_into_view_if_needed()
    expect(host).to_have_attribute("data-world-state", "ready", timeout=20000)
    page.locator('[data-world-immersive]').scroll_into_view_if_needed()
    before = page.evaluate("scrollY")
    page.locator('[data-world-immersive]').tap()
    page.locator('.paper-world-marker[data-place="agent"]').tap()
    settle(page, "world")
    canvas = host.locator("canvas").bounding_box()
    note = page.locator(".paper-world-note").bounding_box()
    assert canvas["height"] >= 100
    assert note["y"] >= canvas["y"] + canvas["height"]
    metrics = projected_size(page, "world")
    assert abs(metrics["aspect"] - metrics["frustumAspect"]) < .01
    capture(page, ".paper-world", f"immersive-{width}.png")
    page.locator('[data-world-immersive]').tap()
    expect(page.locator('.paper-world')).not_to_have_attribute("aria-modal", "true")
    assert abs(page.evaluate("scrollY") - before) <= 2
    context.close()


def test_project_selection_does_not_navigate_through_the_theme(page, base_url):
    page.goto(f"{base_url}/", wait_until="networkidle")
    page.locator('[data-project="jarvis"]').scroll_into_view_if_needed()
    page.evaluate("""() => {
      window.projectNavigationEvents = [];
      window.location$.subscribe(url => window.projectNavigationEvents.push(url.href));
      window.projectNavigationEvents = [];
    }""")
    history_length = page.evaluate("history.length")
    for project in ["agent", "algorithm", "notebook", "jarvis"]:
        choice = page.locator(f'[data-project="{project}"]')
        choice.scroll_into_view_if_needed()
        before = page.evaluate("scrollY")
        choice.click()
        expect(page.locator(f'#exhibit-{project}')).to_be_visible()
        assert abs(page.evaluate("scrollY") - before) <= 2
        assert page.evaluate("history.length") == history_length
    assert page.evaluate("window.projectNavigationEvents") == []


def test_late_notebook_loading_does_not_move_the_workbench(browser, base_url):
    context = browser.new_context(viewport={"width":390,"height":844}, has_touch=True, reduced_motion="reduce")
    page = context.new_page()
    pending = []
    page.route("**/studio-world/World.js", lambda route: pending.append(route))
    page.goto(f"{base_url}/index.html", wait_until="domcontentloaded")
    host = page.locator(".bench-viewport")
    host.scroll_into_view_if_needed()
    expect(host).to_have_attribute("data-bench-state", "ready", timeout=20000)
    page.evaluate("document.fonts.ready")
    page.wait_for_function("document.querySelector('.paper-world-viewport').dataset.worldState === 'loading'")
    assert pending
    before_height = page.locator(".paper-world").bounding_box()["height"]
    before_scroll = page.evaluate("scrollY")
    pending[0].continue_()
    expect(page.locator(".paper-world-viewport")).to_have_attribute("data-world-state", "ready", timeout=20000)
    page.wait_for_timeout(180)
    after_height = page.locator(".paper-world").bounding_box()["height"]
    assert abs(after_height - before_height) <= 2
    assert abs(page.evaluate("scrollY") - before_scroll) <= 2
    context.close()
