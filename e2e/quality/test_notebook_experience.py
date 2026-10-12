"""A reader can experience the whole notebook without special URL flags."""
import os
from pathlib import Path
import pytest
from playwright.sync_api import expect

def capture_experience(page, name):
    if output := os.environ.get('NOTEBOOK_EXPERIENCE_SCREENSHOTS'):
        directory = Path(output)
        directory.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(directory / name), full_page=True)

@pytest.mark.parametrize('width,height', [(390,844), (768,1024), (1440,900)])
@pytest.mark.parametrize('scheme', ['default', 'slate'])
def test_reader_journey(browser, base_url, width, height, scheme):
    context = browser.new_context(viewport={'width':width,'height':height}, reduced_motion='reduce')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(f'{base_url}/index.html', wait_until='networkidle')
    if scheme == 'slate': page.locator('label[for="__palette_1"]').click()
    expect(page.get_by_role('button', name='Follow the thread')).to_be_visible()
    capture_experience(page, f'arrival-{width}-{scheme}.png')
    page.get_by_role('button', name='Follow the thread').click()
    expect(page.get_by_text('A loose thread becomes a clearer thought.')).to_be_visible()
    for label in ['Find the signal','Gather the good stuff','Take the long way home','Open the workbench','Unfold a note']:
        button = page.get_by_role('button', name=label, exact=True)
        button.click()
        expect(button).to_have_attribute('aria-expanded', 'true')
    page.get_by_role('button', name='Germany', exact=True).click()
    expect(page.get_by_role('button', name='Germany', exact=True)).to_have_attribute('aria-current','location')
    page.get_by_role('button', name='Home', exact=True).click()
    expect(page.get_by_text('The long way around. Back to the Midwest.')).to_be_visible()
    page.get_by_role('button', name='Leave a star', exact=True).click()
    expect(page.get_by_text('Thanks for leaving a little light here.')).to_be_visible()
    assert page.locator('.guest-mark path').count() == 1
    page.get_by_role('button', name='A clean corner', exact=True).click()
    assert page.locator('.guest-mark path').count() == 0
    page.get_by_role('link', name="Let's talk").click(trial=True)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert not errors
    capture_experience(page, f'journey-{width}-{scheme}.png')
    context.close()

def test_keyboard_and_drawn_mark(page, base_url):
    page.goto(f'{base_url}/index.html', wait_until='networkidle')
    button = page.get_by_role('button', name='Find the signal', exact=True)
    button.focus(); button.press('Enter')
    expect(button).to_have_attribute('aria-expanded','true')
    button.press('Enter'); expect(button).to_have_attribute('aria-expanded','false')
    board = page.get_by_role('img', name='Your notebook sketch')
    board.scroll_into_view_if_needed(); box = board.bounding_box()
    page.mouse.move(box['x']+30,box['y']+30); page.mouse.down()
    page.mouse.move(box['x']+70,box['y']+50,steps=8); page.mouse.up()
    assert page.locator('.guest-mark path').count() == 1
    expect(page.get_by_text('Thanks for leaving a little light here.')).to_be_visible()

def test_baseline_comparison(page, base_url):
    page.goto(f'{base_url}/index.html?baseline=1', wait_until='networkidle')
    assert page.locator('.notebook-welcome').count() == 0
    expect(page.locator('#been-around')).to_be_visible()

@pytest.mark.parametrize('scheme', ['default', 'slate'])
def test_notebook_interactions_accessible(page, base_url, scheme):
    from axe_playwright_python.sync_playwright import Axe
    page.goto(f'{base_url}/index.html', wait_until='networkidle')
    if scheme == 'slate': page.locator('label[for="__palette_1"]').click()
    for button in page.locator('.margin-action').all():
        button.click()
    page.get_by_role('button', name='Leave a star').click()
    report = Axe().run(page, context={'include': [['article.md-typeset']]})
    violations = report.response.get('violations', [])
    assert not violations, [(v['id'], [n['html'] for n in v.get('nodes', [])]) for v in violations]
