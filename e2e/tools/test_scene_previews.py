"""Explicit, reproducible exports from the site's own rendered scenes."""
import base64
import os
from pathlib import Path

import pytest


@pytest.mark.skipif(not os.environ.get("ARRIVAL_EXPORT_POSTERS"), reason="Preview assets are exported only on request")
@pytest.mark.parametrize("profile,width,height", [("desktop",1440,1000), ("mobile",390,844), ("tablet",768,1024)])
def test_export_scene_previews(browser, base_url, profile, width, height):
    from e2e.quality.test_responsive_scenes import observe_scenes, settle
    from playwright.sync_api import expect
    context = browser.new_context(viewport={"width":width,"height":height}, reduced_motion="reduce")
    page = context.new_page()
    observe_scenes(page)
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    world = page.locator('.paper-world-viewport')
    world.scroll_into_view_if_needed()
    expect(world).to_have_attribute('data-world-state','ready',timeout=20000)
    settle(page, "world")
    page.wait_for_function("[...window.__world.materials.owned].every(r => !r.isTexture || !(r.image instanceof HTMLImageElement) || r.image.complete)")
    output = Path(os.environ["ARRIVAL_EXPORT_POSTERS"])
    output.mkdir(parents=True,exist_ok=True)
    def export(key, name):
        data = page.evaluate("""key => {const s=window['__'+key];const ratio=s.renderer.getPixelRatio();s.renderer.setPixelRatio(2);s.renderer.render(s.scene,s.camera);const image=s.renderer.domElement.toDataURL('image/webp', .9).split(',')[1];s.renderer.setPixelRatio(ratio);return image;}""", key)
        (output/f"{name}-{profile}.webp").write_bytes(base64.b64decode(data))
    export('world', 'notebook-preview')
    host=page.locator('.bench-viewport')
    host.scroll_into_view_if_needed()
    expect(host).to_have_attribute('data-bench-state','ready',timeout=20000)
    for project in ['jarvis','agent','algorithm','notebook']:
        page.locator(f'[data-project="{project}"]').click()
        host.scroll_into_view_if_needed()
        settle(page, 'bench')
        export('bench', f'bench-{project}')
    context.close()


@pytest.mark.skipif(not os.environ.get("ARRIVAL_EXPORT_POSTERS"), reason="Image formats are exported only on request")
def test_export_family_webp(page, base_url):
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    output=Path(os.environ["ARRIVAL_EXPORT_POSTERS"])
    for size, name in [(400,'the-good-stuff'),(128,'the-good-stuff-thumb')]:
        data=page.evaluate("""async size => {
          const image=new Image();image.src=new URL('./assets/images/studio/the-good-stuff.png',location.href).href;
          await image.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
          canvas.getContext('2d').drawImage(image,0,0,size,size);
          return canvas.toDataURL('image/webp',.92).split(',')[1];
        }""",size)
        (output/f'{name}.webp').write_bytes(base64.b64decode(data))
