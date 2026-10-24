"""The personal notebook becomes a studio with accessible project experiments."""
import pytest
from playwright.sync_api import expect


@pytest.mark.parametrize("scheme", ["default", "slate"])
def test_notebook_interactions_accessible(page, base_url, scheme):
    from axe_playwright_python.sync_playwright import Axe
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    if scheme == "slate":
        page.locator('label[for="__palette_1"]').click()
    for key in ["jarvis", "agent", "algorithm", "notebook"]:
        page.locator(f'[data-project="{key}"]').click()
        if key == "notebook":
            page.get_by_role("button", name="Leave a star", exact=True).click()
        report = Axe().run(page, context={"include": [["article.md-typeset"]]})
        violations = report.response.get("violations", [])
        assert not violations, [(v["id"], [n["html"] for n in v.get("nodes", [])]) for v in violations]
    for ink in ["Clay", "Blue", "Pine"]:
        page.get_by_role("button", name=ink, exact=True).click()
        report = Axe().run(page, context={"include": [["article.md-typeset"]]})
        assert not report.response.get("violations", []), ink


def test_project_links_support_browser_history(page, base_url):
    page.goto(f"{base_url}/index.html#exhibit-agent", wait_until="networkidle")
    expect(page.locator("#exhibit-agent")).to_be_visible()
    page.evaluate("location.hash = 'exhibit-algorithm'")
    expect(page.locator("#exhibit-algorithm")).to_be_visible()
    page.go_back()
    expect(page.locator("#exhibit-agent")).to_be_visible()
