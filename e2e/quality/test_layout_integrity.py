"""
Layout integrity e2e tests.
Ensures the one-page typewriter slate stays readable and quiet.

These tests verify that:
1. Header/footer remain visible
2. Content is readable and properly positioned
3. Responsive layouts work across device sizes
"""

import pytest
from playwright.sync_api import Page, expect


class TestLayoutIntegrity:
    """Tests to ensure the paper backdrop doesn't break MkDocs layout."""

    @pytest.fixture(autouse=True)
    def navigate_to_home(self, page: Page, base_url: str):
        """Navigate to home page before each test."""
        page.goto(f"{base_url}/index.html")
        page.wait_for_load_state("networkidle")

    def test_header_is_visible(self, page: Page):
        """Header should be visible and not obscured."""
        header = page.locator(".md-header")
        expect(header).to_be_visible()

        box = header.bounding_box()
        assert box is not None, "Header should have a bounding box"
        assert box["y"] >= 0, "Header should be at or near top of viewport"
        assert box["y"] < 100, "Header should be near the top"

    def test_main_content_visible(self, page: Page):
        """Main content area should be visible."""
        content = page.locator(".md-content")
        expect(content).to_be_visible()

    def test_footer_is_visible_on_home_page(self, page: Page):
        """Home page should render the global footer."""
        footer = page.locator(".md-footer")
        expect(footer).to_be_visible()

    def test_footer_is_visible_on_error_page(self, page: Page, base_url: str):
        """The public error page should render the global footer."""
        page.goto(f"{base_url}/404/")
        page.wait_for_load_state("networkidle")

        footer = page.locator(".md-footer")
        expect(footer).to_be_visible()

    def test_content_is_readable(self, page: Page):
        """Content text should be visible above the paper background."""
        content_inner = page.locator(".md-content__inner")
        expect(content_inner).to_be_visible()


class TestResponsiveLayout:
    """Tests for responsive layout at different viewport sizes."""

    VIEWPORT_SIZES = [
        ("mobile-small", 320, 568),
        ("mobile-medium", 360, 800),
        ("mobile-standard", 390, 844),
        ("mobile-large", 430, 932),
        ("tablet", 768, 1024),
        ("desktop-flow-edge", 1024, 768),
        ("desktop", 1440, 900),
        ("wide", 1920, 1080),
    ]

    @pytest.fixture
    def page_at_size(self, browser, base_url: str):
        """Factory fixture to create pages at different viewport sizes."""
        pages = []

        def _create_page(width: int, height: int) -> Page:
            context = browser.new_context(viewport={"width": width, "height": height})
            page = context.new_page()
            page.goto(f"{base_url}/index.html")
            page.wait_for_load_state("networkidle")
            pages.append((page, context))
            return page

        yield _create_page

        for page, context in pages:
            context.close()

    @pytest.mark.parametrize("name,width,height", VIEWPORT_SIZES)
    def test_header_visible_at_viewport(self, page_at_size, name: str, width: int, height: int):
        """Header should be visible at all viewport sizes."""
        page = page_at_size(width, height)
        header = page.locator(".md-header")
        expect(header).to_be_visible()

    @pytest.mark.parametrize("name,width,height", VIEWPORT_SIZES)
    def test_content_visible_at_viewport(self, page_at_size, name: str, width: int, height: int):
        """Main content should be visible at all viewport sizes."""
        page = page_at_size(width, height)
        content = page.locator(".md-content")
        expect(content).to_be_visible()

    @pytest.mark.parametrize("name,width,height", VIEWPORT_SIZES)
    def test_no_horizontal_scroll(self, page_at_size, name: str, width: int, height: int):
        """Page should not have horizontal overflow."""
        page = page_at_size(width, height)

        scroll_width = page.evaluate("document.documentElement.scrollWidth")
        client_width = page.evaluate("document.documentElement.clientWidth")

        assert scroll_width <= client_width + 5, (
            f"Horizontal scroll detected at {name} ({width}x{height}): "
            f"scrollWidth={scroll_width}, clientWidth={client_width}"
        )
