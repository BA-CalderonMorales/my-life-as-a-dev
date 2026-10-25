"""Cold-load filmstrip and layout observations for the notebook arrival."""
import base64
import json
import os
from pathlib import Path

import pytest


@pytest.mark.parametrize("width,height", [(390,844), (1440,1000)])
def test_cold_arrival_audit(browser, base_url, width, height):
    context = browser.new_context(viewport={"width":width,"height":height}, has_touch=width<700)
    page = context.new_page()
    page.add_init_script("""
      window.arrival = {shifts: [], paints: [], largest: []};
      new PerformanceObserver(list => list.getEntries().forEach(e => {
        if (!e.hadRecentInput) arrival.shifts.push({time:e.startTime,value:e.value,nodes:e.sources?.map(s => s.node?.className)});
      })).observe({type:'layout-shift',buffered:true});
      new PerformanceObserver(list => list.getEntries().forEach(e => arrival.paints.push({name:e.name,time:e.startTime}))).observe({type:'paint',buffered:true});
      new PerformanceObserver(list => list.getEntries().forEach(e => arrival.largest.push({time:e.startTime,size:e.size,tag:e.element?.className}))).observe({type:'largest-contentful-paint',buffered:true});
    """)
    session = context.new_cdp_session(page)
    session.send("Network.enable")
    session.send("Network.setCacheDisabled", {"cacheDisabled":True})
    session.send("Network.emulateNetworkConditions", {"offline":False,"latency":120,"downloadThroughput":200000,"uploadThroughput":100000})
    session.send("Emulation.setCPUThrottlingRate", {"rate":4})
    page.goto(f"{base_url}/", wait_until="commit")
    directory = Path(os.environ.get("ARRIVAL_CAPTURES", "/tmp/arrival-before"))
    directory.mkdir(parents=True, exist_ok=True)
    frames = []
    for at in [250,700,1500,3000,5000,8000,12000]:
        elapsed = page.evaluate("performance.now()")
        if elapsed < at:
            page.wait_for_timeout(at-elapsed)
        data = session.send("Page.captureScreenshot", {"format":"png","captureBeyondViewport":False})
        (directory/f"arrival-{width}-{at}.png").write_bytes(base64.b64decode(data["data"]))
        frames.append(page.evaluate("""() => ({time:performance.now(),world:document.querySelector('.paper-world-viewport')?.dataset.worldState,canvas:document.querySelector('.paper-world-viewport canvas')?.getBoundingClientRect().toJSON(),height:document.documentElement.scrollHeight})"""))
    report = page.evaluate("""() => ({...arrival,resources:performance.getEntriesByType('resource').map(r=>({name:r.name.split('/').slice(-2).join('/'),start:r.startTime,end:r.responseEnd,bytes:r.transferSize}))})""")
    assert sum(e["value"] for e in report["shifts"]) < .02
    assert frames[-1]["world"] == "ready"
    assert not any('fonts.googleapis' in e['name'] or 'fonts.gstatic' in e['name'] for e in report['resources'])
    report["frames"] = frames
    (directory/f"metrics-{width}.json").write_text(json.dumps(report, indent=2))
    print(json.dumps({"width":width,"cls":sum(e["value"] for e in report["shifts"]),"paints":report["paints"],"frames":frames}))
    context.close()








def test_local_handwriting_is_used_without_third_party_requests(page, base_url):
    requests = []
    page.on('request', lambda request: requests.append(request.url))
    page.goto(f'{base_url}/index.html', wait_until='networkidle')
    session = page.context.new_cdp_session(page)
    session.send('DOM.enable')
    session.send('CSS.enable')
    document = session.send('DOM.getDocument')['root']['nodeId']
    node = session.send('DOM.querySelector', {'nodeId':document,'selector':'.studio-world-introduction p'})['nodeId']
    fonts = session.send('CSS.getPlatformFontsForNode', {'nodeId':node})['fonts']
    assert any(font['isCustomFont'] and 'Playpen Sans' in font['familyName'] for font in fonts)
    assert not any(domain in url for url in requests for domain in ['fonts.googleapis.com','fonts.gstatic.com','api.github.com'])


@pytest.mark.parametrize('width,height', [(390,844), (1440,1000)])
def test_preview_waits_for_textures_and_a_stable_first_frame(browser, base_url, width, height):
    from e2e.quality.test_responsive_scenes import observe_scenes
    from playwright.sync_api import expect
    context = browser.new_context(viewport={'width':width,'height':height})
    page = context.new_page()
    observe_scenes(page)
    pending = []
    page.route('**/the-good-stuff-thumb.webp', lambda route: pending.append(route))
    page.goto(f'{base_url}/index.html', wait_until='domcontentloaded')
    host = page.locator('.paper-world-viewport')
    host.scroll_into_view_if_needed()
    expect(host.locator('canvas')).to_have_count(1,timeout=20000)
    page.wait_for_function('window.__world?.world')
    assert pending
    expect(host).to_have_attribute('aria-busy','true')
    expect(host.locator('canvas')).to_have_css('visibility','hidden')
    expect(host.locator('canvas')).to_have_attribute('tabindex','-1')
    expect(host.locator('.scene-preview img')).to_be_visible()
    page.wait_for_function("document.querySelector('.scene-preview img').complete")
    before = host.bounding_box()
    pending[0].continue_()
    expect(host).to_have_attribute('data-world-state','ready',timeout=20000)
    expect(host).to_have_attribute('aria-busy','false')
    expect(host.locator('canvas')).to_have_css('opacity','1')
    assert abs(host.bounding_box()['height']-before['height']) < 1
    assert page.evaluate('Math.abs(window.__world.viewSpan-window.__world.spanTarget)') < .001
    assert page.evaluate('window.__world.focus.distanceTo(window.__world.focusTarget)') < .001
    expect(host.locator('.paper-world-marker:disabled')).to_have_count(0)
    context.close()


def test_navigation_during_preparation_releases_the_old_scene(page, base_url):
    from e2e.quality.test_responsive_scenes import observe_scenes
    from playwright.sync_api import expect
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    observe_scenes(page)
    pending = []
    page.route('**/the-good-stuff-thumb.webp', lambda route: pending.append(route))
    page.goto(f'{base_url}/', wait_until='domcontentloaded')
    page.wait_for_function('window.__world?.world')
    assert pending
    page.evaluate("""() => {
      window.previousWorld=window.__world;
      const link=document.createElement('a');link.href='./404/';link.id='arrival-away';link.textContent='Error page';
      document.querySelector('article').appendChild(link);
    }""")
    page.locator('#arrival-away').click()
    page.wait_for_url('**/404/')
    expect(page.locator('.studio-home')).to_have_count(0)
    assert page.evaluate('window.previousWorld.destroyed')
    assert page.evaluate('window.previousWorld.materials.owned.size') == 0
    pending[0].continue_()
    page.unroute('**/the-good-stuff-thumb.webp')
    page.go_back(wait_until='domcontentloaded')
    expect(page.locator('.paper-world-viewport')).to_have_attribute('data-world-state','ready',timeout=20000)
    expect(page.locator('.paper-world-viewport canvas')).to_have_count(1)
    assert not errors


def test_loading_failure_keeps_the_preview_and_project_controls(page, base_url):
    from playwright.sync_api import expect
    page.route('**/studio-world/World.js', lambda route: route.abort())
    page.route('**/studio-workbench/Workbench.js', lambda route: route.abort())
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(f'{base_url}/index.html',wait_until='networkidle')
    expect(page.locator('.paper-world-viewport')).to_have_attribute('data-world-state','fallback')
    expect(page.locator('.scene-preview img')).to_be_visible()
    page.locator('[data-project="algorithm"]').click()
    page.locator('.bench-viewport').scroll_into_view_if_needed()
    expect(page.locator('.bench-viewport')).to_have_attribute('data-bench-state','fallback')
    page.get_by_role('button',name='Next comparison',exact=True).click()
    expect(page.locator('.studio-sort-status')).to_contain_text('Comparison 1')
    assert not errors


@pytest.mark.parametrize('project',['agent','algorithm','notebook'])
def test_workbench_first_frame_is_already_arranged(browser, base_url, project):
    from e2e.quality.test_responsive_scenes import observe_scenes
    from playwright.sync_api import expect
    context=browser.new_context(viewport={'width':390,'height':844},has_touch=True)
    page=context.new_page()
    observe_scenes(page)
    page.goto(f'{base_url}/index.html#exhibit-{project}',wait_until='networkidle')
    host=page.locator('.bench-viewport')
    host.scroll_into_view_if_needed()
    expect(host).to_have_attribute('data-bench-state','ready',timeout=20000)
    assert page.evaluate("""() => {
      const s=window.__bench;
      return [...s.objects].every(([id,a])=>a.group.position.distanceTo(s.targets.get(id).position)<.001 && Math.abs(a.group.scale.x-s.targets.get(id).scale)<.001)
        && Math.abs(s.viewSpan-s.spanTarget)<.001;
    }""")
    expect(host).to_have_attribute('aria-busy','false')
    context.close()


def test_project_links_remain_usable_before_the_studio_script(page, base_url):
    from playwright.sync_api import expect
    pending=[]
    page.route('**/assets/js/studio.js',lambda route:pending.append(route))
    page.goto(f'{base_url}/index.html#exhibit-notebook',wait_until='commit')
    expect(page.locator('#exhibit-notebook')).to_be_visible()
    page.locator('[data-project="algorithm"]').click()
    expect(page.locator('#exhibit-algorithm')).to_be_visible()
    expect(page.locator('#exhibit-notebook')).to_be_hidden()
    assert pending
    pending[0].continue_()
    expect(page.locator('.studio-home')).to_have_class('studio-home studio-ready')
    expect(page.locator('[data-project="algorithm"]')).to_have_attribute('aria-current','true')
