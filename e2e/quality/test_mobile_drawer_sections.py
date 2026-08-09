"""
Mobile navigation drawer gating tests.

At mobile widths the Home-only public surface should not render a hamburger
drawer at all. Archived sections must remain absent from the DOM.
"""

import pytest
from playwright.sync_api import Page, expect

# Top-level sections that are gated off by default. Their nav hrefs must never
# appear in the drawer.
OFF_SECTION_HREFS = (
    "/learning/",
    "/docs-as-code/",
    "/projects/",
    "/canvas/",
    "/resume/",
)

OFF_SECTION_TITLES = (
    "Learning",
    "Docs-as-Code",
    "Docs as Code",
    "Projects",
    "Canvas",
    "About Me",
)


@pytest.fixture
def mobile_page(page: Page, base_url: str) -> Page:
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    return page


class TestMobileDrawerSections:
    """The Home-only mobile shell must not expose a drawer."""

    def test_hamburger_trigger_is_absent(self, mobile_page: Page):
        expect(mobile_page.locator("label.mlad-hamburger")).to_have_count(0)

    def test_drawer_has_no_off_section_links(self, mobile_page: Page):
        """No off-section hrefs should be present in the primary drawer nav."""
        links = mobile_page.locator(".md-nav--primary a.md-nav__link")
        count = links.count()
        for i in range(count):
            href = links.nth(i).get_attribute("href") or ""
            for off in OFF_SECTION_HREFS:
                assert off not in href, f"Drawer exposes off-section link: {href}"

    def test_drawer_has_no_off_section_titles(self, mobile_page: Page):
        """No off-section titles should be visible in the drawer."""
        drawer = mobile_page.locator(".md-nav--primary")
        text = drawer.inner_text() if drawer.count() else ""
        for title in OFF_SECTION_TITLES:
            assert title not in text, f"Drawer exposes off-section title: {title}"

    def test_drawer_has_no_home_link(self, mobile_page: Page):
        """A lone Home item should not become an empty drawer."""
        links = mobile_page.locator(".md-nav--primary a.md-nav__link")
        assert links.count() == 0
