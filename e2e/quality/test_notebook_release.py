"""Release regressions for scratchpad limits and instant navigation cleanup."""
from playwright.sync_api import expect

def test_theme_controls_initialize_and_switch(page, base_url):
    page.goto(f'{base_url}/index.html', wait_until='networkidle')
    page.get_by_title('Switch to dark mode', exact=True).click(timeout=5000)
    expect(page.locator('body')).to_have_attribute('data-md-color-scheme', 'slate')
    page.get_by_title('Switch to light mode', exact=True).click(timeout=5000)
    expect(page.locator('body')).to_have_attribute('data-md-color-scheme', 'default')

def test_scratchpad_is_bounded_and_clearable(page, base_url):
    page.goto(f'{base_url}/index.html#exhibit-notebook', wait_until='networkidle')
    page.get_by_role('button', name='Leave a star').evaluate('(button) => { for (let i=0;i<100;i++) button.click(); }')
    expect(page.locator('.studio-sketchpad path')).to_have_count(64)
    page.get_by_role('button', name='Fresh page').click()
    expect(page.locator('.studio-sketchpad path')).to_have_count(0)
    page.get_by_role('button', name='Leave a star').click()
    expect(page.locator('.studio-sketchpad path')).to_have_count(1)

def test_long_stroke_stays_bounded(page, base_url):
    page.goto(f'{base_url}/index.html', wait_until='networkidle')
    page.locator('[data-project="notebook"]').click()
    board = page.get_by_role('img', name='Your temporary sketch')
    board.scroll_into_view_if_needed()
    box = board.bounding_box()
    page.mouse.move(box['x'] + box['width']/2, box['y'] + box['height']/2)
    page.mouse.down()
    board.evaluate('''board => {
        const box = board.getBoundingClientRect();
        for(let i=0;i<2000;i++) board.dispatchEvent(new PointerEvent('pointermove', {
            clientX: box.x + box.width/2 + (i%20), clientY: box.y + box.height/2
        }));
    }''')
    page.mouse.up()
    commands = board.locator('path').get_attribute('d').count(' L')
    assert commands == 512

def test_instant_navigation_cleans_up_the_studio(page, base_url):
    page.goto(f'{base_url}/index.html', wait_until='networkidle')
    expect(page.locator('.studio-ready')).to_have_count(1)
    page.locator('[data-project="algorithm"]').click()
    page.get_by_role('button', name='Play it through', exact=True).click()
    page.evaluate('''() => {
        const link = document.createElement('a');
        link.href = './404/'; link.id = 'release-navigation'; link.textContent = 'Error page';
        document.querySelector('article').appendChild(link);
    }''')
    page.locator('#release-navigation').click()
    page.wait_for_url('**/404/')
    expect(page.locator('.studio-home')).to_have_count(0)
    page.go_back(wait_until='networkidle')
    expect(page.locator('.studio-ready')).to_have_count(1)
    page.locator('[data-project="algorithm"]').click()
    expect(page.get_by_role('button', name='Play it through', exact=True)).to_be_visible()
