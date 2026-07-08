"""
Accessibility regression test — runs axe-core against all key pages
across viewports (mobile, tablet, desktop) and color schemes (light/dark).
"""

import pytest
from axe_playwright_python.sync_playwright import Axe

PAGES = [
    ("/index.html", "home"),
    ("/404/", "404"),
]

VIEWPORTS = [
    ("mobile", {"width": 390, "height": 844}),
    ("tablet", {"width": 768, "height": 1024}),
    ("desktop", {"width": 1440, "height": 900}),
]

SCHEMES = [
    ("light", "default"),
    ("dark", "slate"),
]

def _set_color_scheme(page, scheme: str):
    """Set MkDocs Material color scheme via localStorage + reload."""
    page.evaluate(f"""
        localStorage.setItem('/.__palette', JSON.stringify({{index: {'0' if scheme == 'slate' else '1'}}}));
    """)
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(800)

@pytest.mark.parametrize("url_path,name", PAGES)
@pytest.mark.parametrize("viewport_name,viewport", VIEWPORTS)
@pytest.mark.parametrize("scheme_name,scheme", SCHEMES)
def test_accessibility(browser, base_url, url_path, name, viewport_name, viewport, scheme_name, scheme):
    context = browser.new_context(viewport=viewport)
    page = context.new_page()
    page.goto(f"{base_url}{url_path}", wait_until="networkidle")
    page.wait_for_timeout(500)
    _set_color_scheme(page, scheme)

    # Note: Disable some rules if MkDocs inherently has issues,
    # but we want to check for contrasts and structural basics
    # mandated by the active Lumen accessibility baseline
    import json
    axe = Axe()
    results = axe.run(page)

    # Filter out known safe/MkDocs-specific issues
    ignored_rules = {"aria-progressbar-name", "region"}
    filtered_violations = [v for v in results.response.get("violations", []) if v["id"] not in ignored_rules]

    if filtered_violations:
        errors = []
        for v in filtered_violations:
            errors.append(f"- {v['id']}: {v['help']} ({len(v.get('nodes', []))} elements)")
            for node in v.get("nodes", []):
                errors.append(f"  * {node['html']}")
        pytest.fail(f"Accessibility violations on {url_path} ({viewport_name}/{scheme_name}):\n" + "\n".join(errors))

    
    context.close()
