"""Verify the opt-in Blender study, its fallback, and its idle cost."""
import json
import os
from pathlib import Path

import pytest
from playwright.sync_api import expect


def reveal_plane(page):
    page.locator('#been-around').evaluate('el => el.scrollIntoView({block: "center"})')
    return page.get_by_role('button', name='Launch the paper plane')


def capture(page, name):
    if output := os.environ.get('PAPER_FLIGHT_SCREENSHOT_DIR'):
        directory = Path(output)
        directory.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(directory / name), full_page=True)


def test_original_does_not_download_geometry(page, base_url):
    requests = []
    page.on('request', lambda request: requests.append(request.url))
    page.goto(f'{base_url}/index.html', wait_until='networkidle')
    page.locator('#been-around').evaluate('el => el.scrollIntoView()')
    page.wait_for_timeout(300)
    assert page.locator('.paper-flight-host').count() == 0
    assert not any('paper-flight.json' in url or 'paper-flight.css' in url for url in requests)


@pytest.mark.parametrize('width,height', [(390, 844), (768, 1024), (1440, 900)])
@pytest.mark.parametrize('scheme', ['default', 'slate'])
def test_static_preview_preserves_notebook(browser, base_url, width, height, scheme):
    context = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(f'{base_url}/index.html?flight=1', wait_until='networkidle')
    if scheme == 'slate':
        page.locator('label[for="__palette_1"]').click()
    plane = reveal_plane(page)
    expect(plane).to_be_visible()
    expect(page.locator('.paper-flight-launch polygon')).to_have_count(4)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    plane.click()
    assert not page.locator('.paper-flight-host').get_attribute('data-flying')
    assert plane.evaluate('el => getComputedStyle(el).transform') == 'none'
    assert not errors
    page.get_by_role('link', name='Email me', exact=True).click(trial=True)
    page.evaluate('scrollTo(0, 0)')
    capture(page, f'flight-{width}-{scheme}.png')
    context.close()


def test_flight_keyboard_return_and_payload(page, base_url):
    errors, assets = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('response', lambda response: assets.append(response) if response.url.endswith('paper-flight.json') else None)
    page.goto(f'{base_url}/index.html?flight=1', wait_until='networkidle')
    plane = reveal_plane(page)
    expect(plane).to_be_visible()
    plane.focus()
    plane.press('Enter')
    expect(page.locator('.paper-flight-host')).to_have_attribute('data-flying', '')
    page.wait_for_timeout(600)
    assert plane.evaluate('el => getComputedStyle(el).transform') != 'none'
    capture(page, 'flight-in-motion.png')
    expect(page.locator('.paper-flight-host')).not_to_have_attribute('data-flying', '', timeout=3000)
    assert plane.evaluate('el => getComputedStyle(el).transform') == 'none'
    assert len(assets) == 1
    payload = assets[0].body()
    assert len(payload) < 4096, 'Baked geometry must stay below 4 KB'
    assert len(json.loads(payload)['frames']) >= 24
    assert not errors
    # A second launch works, and scrolling it away immediately cancels the work.
    plane.press('Space')
    expect(page.locator('.paper-flight-host')).to_have_attribute('data-flying', '')
    page.evaluate('scrollTo(0, 0)')
    expect(page.locator('.paper-flight-host')).not_to_have_attribute('data-flying', '')


def test_failed_optional_asset_keeps_original_drawing(page, base_url):
    page.route('**/paper-flight.json', lambda route: route.abort())
    page.goto(f'{base_url}/index.html?flight=1', wait_until='networkidle')
    page.locator('#been-around').evaluate('el => el.scrollIntoView()')
    page.wait_for_timeout(400)
    assert page.locator('.paper-flight-host').count() == 0
    assert page.locator('.doodle-plane').evaluate('el => getComputedStyle(el).visibility') == 'visible'
