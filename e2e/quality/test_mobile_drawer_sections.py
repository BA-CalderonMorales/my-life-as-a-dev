"""
Mobile navigation drawer gating tests.

At mobile widths the hamburger drawer must NOT expose any off-section
(Learning, Docs-as-Code, Projects, Canvas, About Me) even though those
sections exist in the source archive. Only Home (the landing page) should
appear.
"""

import pytest
from playwright.sync_api import Page, expect

from ..shared.utils import load_features

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
    # Open the hamburger drawer.
    page.click("label.mlad-hamburger")
    page.wait_for_selector(".md-nav--primary", state="visible")
    return page


class TestMobileDrawerSections:
    """The open mobile drawer must only show the Home landing tab."""

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
        text = drawer.inner_text()
        for title in OFF_SECTION_TITLES:
            assert title not in text, f"Drawer exposes off-section title: {title}"

    def test_drawer_contains_home(self, mobile_page: Page):
        """Home (the landing page) remains the only visible tab."""
        links = mobile_page.locator(".md-nav--primary a.md-nav__link")
        assert links.count() >= 1
        text = mobile_page.locator(".md-nav--primary").inner_text().lower()
        assert "home" in text
