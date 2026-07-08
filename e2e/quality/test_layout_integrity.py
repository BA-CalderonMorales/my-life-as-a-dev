"""
Layout integrity e2e tests.
Ensures the single-page shell does not break MkDocs Material core styles.

These tests verify that:
1. Single-page navigation chrome stays hidden
2. Header/footer remain visible
3. Content is readable and properly positioned
4. Responsive layouts work across device sizes
"""

import pytest
from playwright.sync_api import Page, expect


class TestLayoutIntegrity:
    """Tests to ensure the page backdrop doesn't break MkDocs layout."""

    @pytest.fixture(autouse=True)
    def navigate_to_home(self, page: Page, base_url: str):
        """Navigate to home page before each test."""
        page.goto(f"{base_url}/index.html")
        page.wait_for_load_state("networkidle")

    def test_header_is_visible(self, page: Page):
        """Header should be visible and not obscured."""
        header = page.locator(".md-header")
        expect(header).to_be_visible()

        # Header should be at the top of the page
        box = header.bounding_box()
        assert box is not None, "Header should have a bounding box"
        assert box["y"] >= 0, "Header should be at or near top of viewport"
        assert box["y"] < 100, "Header should be near the top"

    def test_navigation_tabs_hidden_for_single_page_shell(self, page: Page):
        """A lone Home item should not render as a docs-style tab bar."""
        tabs = page.locator(".md-tabs")
        expect(tabs).to_have_count(0)

    def test_main_content_visible(self, page: Page):
        """Main content area should be visible."""
        content = page.locator(".md-content")
        expect(content).to_be_visible()

    def test_back_to_top_uses_icon_only_markup(self, page: Page):
        """Back-to-top control should render the custom SVG without visible text."""
        top_button = page.locator(".md-top")
        expect(top_button).to_have_count(1)
        expect(top_button.locator("svg.mlad-top-icon")).to_have_count(1)

        visible_text = page.evaluate(
            "() => document.querySelector('.md-top').innerText.trim()"
        )
        assert visible_text == "", "Back-to-top text should not be visible in the button"

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

    def test_back_to_top_mobile_position(self, browser, base_url: str):
        """Back-to-top should sit in the bottom-left mobile corner when visible."""
        context = browser.new_context(viewport={"width": 375, "height": 667})
        page = context.new_page()
        try:
            page.goto(f"{base_url}/index.html")
            page.wait_for_load_state("networkidle")
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.locator(".md-top").evaluate(
                "(el) => { el.hidden = false; el.dataset.mdState = 'visible'; }"
            )

            box = page.locator(".md-top").bounding_box()
            assert box is not None, "Back-to-top should have a bounding box"
            assert 24 <= box["x"] <= 48, (
                f"Back-to-top should be near the left edge on mobile, got x={box['x']}"
            )
            assert box["y"] + box["height"] <= 667 - 8, (
                "Back-to-top should not sit below the viewport"
            )
            assert box["y"] >= 667 - 96, (
                f"Back-to-top should be near the bottom on mobile, got y={box['y']}"
            )
        finally:
            context.close()

    def test_back_to_top_desktop_position(self, browser, base_url: str):
        """Back-to-top should sit in the bottom-left desktop corner when visible."""
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        try:
            page.goto(f"{base_url}/index.html")
            page.wait_for_load_state("networkidle")
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.locator(".md-top").evaluate(
                "(el) => { el.hidden = false; el.dataset.mdState = 'visible'; }"
            )

            box = page.locator(".md-top").bounding_box()
            assert box is not None, "Back-to-top should have a bounding box"
            assert 30 <= box["x"] <= 56, (
                f"Back-to-top should be near the left edge on desktop, got x={box['x']}"
            )
            assert box["x"] + box["width"] < 1280 / 2, (
                "Back-to-top should not render on the right side of the viewport"
            )
            assert box["y"] + box["height"] <= 800 - 8, (
                "Back-to-top should not sit below the viewport"
            )
            assert box["y"] >= 800 - 104, (
                f"Back-to-top should be near the bottom on desktop, got y={box['y']}"
            )
        finally:
            context.close()

    def test_content_is_readable(self, page: Page):
        """Content text should have proper z-index above background."""
        content_inner = page.locator(".md-content__inner")
        expect(content_inner).to_be_visible()

    def test_creative_canvas_is_behind_content(self, page: Page):
        """Creative canvas should layer below the readable UI chrome."""
        container = page.locator(".creative-canvas")

        if container.count() == 0:
            pytest.skip("Creative canvas is disabled by feature flag")

        layers = page.evaluate("""() => {
            const readZ = (selector) => window.getComputedStyle(document.querySelector(selector)).zIndex;
            return {
                container: readZ('.creative-canvas'),
                content: readZ('.md-content'),
                header: readZ('.md-header'),
            };
        }""")

        def to_int(value: str) -> int:
            return 0 if value in (None, "", "auto") else int(value)

        container_z = to_int(layers["container"])
        content_z = to_int(layers["content"])
        header_z = to_int(layers["header"])

        assert container_z < content_z, (
            "Creative canvas should layer below content. "
            f"Computed z-indexes: {layers}"
        )
        assert container_z < header_z, (
            "Creative canvas should layer below the header. "
            f"Computed z-indexes: {layers}"
        )

    def test_creative_canvas_is_fixed_position(self, page: Page):
        """Creative canvas should use fixed positioning."""
        container = page.locator(".creative-canvas")

        if container.count() == 0:
            pytest.skip("Creative canvas is disabled by feature flag")

        position = page.evaluate(
            "window.getComputedStyle(document.querySelector('.creative-canvas')).position"
        )
        assert position == "fixed", f"Container should be position:fixed, got {position}"

    def test_creative_canvas_has_no_pointer_events(self, page: Page):
        """Creative canvas should not intercept mouse events."""
        container = page.locator(".creative-canvas")

        if container.count() == 0:
            pytest.skip("Creative canvas is disabled by feature flag")

        pointer_events = page.evaluate(
            "window.getComputedStyle(document.querySelector('.creative-canvas')).pointerEvents"
        )
        assert pointer_events == "none", f"Container should have pointer-events:none, got {pointer_events}"


class TestResponsiveLayout:
    """Tests for responsive layout at different viewport sizes."""

    VIEWPORT_SIZES = [
        ("mobile", 375, 667),
        ("tablet", 768, 1024),
        ("desktop", 1280, 800),
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

        # Cleanup
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

        # Check if document has horizontal scroll
        scroll_width = page.evaluate("document.documentElement.scrollWidth")
        client_width = page.evaluate("document.documentElement.clientWidth")

        # Allow small tolerance for rounding
        assert scroll_width <= client_width + 5, (
            f"Horizontal scroll detected at {name} ({width}x{height}): "
            f"scrollWidth={scroll_width}, clientWidth={client_width}"
        )

    @pytest.mark.parametrize("name,width,height", VIEWPORT_SIZES)
    def test_creative_canvas_does_not_overflow(self, page_at_size, name: str, width: int, height: int):
        """Creative canvas should not cause overflow."""
        page = page_at_size(width, height)

        container = page.locator(".creative-canvas")
        if container.count() == 0:
            pytest.skip("Creative canvas is disabled by feature flag")

        # Container should be contained within viewport
        box = container.bounding_box()
        if box:
            # Width and height should not exceed viewport
            assert box["width"] <= width + 1, f"Container width {box['width']} exceeds viewport {width}"
            assert box["height"] <= height + 1, f"Container height {box['height']} exceeds viewport {height}"


class TestSinglePageNavigation:
    """Tests for the intentional Home + 404 public surface."""

    PUBLIC_PATHS = ("/index.html", "/404/")

    @pytest.mark.parametrize("path", PUBLIC_PATHS)
    def test_public_pages_do_not_show_primary_nav_links(self, browser, base_url: str, path: str):
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        try:
            page.goto(f"{base_url}{path}", timeout=60000)
            page.wait_for_load_state("networkidle")

            visible_nav_links = page.locator(".md-sidebar--primary .md-nav__link:visible")
            expect(page.locator(".md-tabs")).to_have_count(0)
            assert visible_nav_links.count() == 0
        finally:
            context.close()

    def test_mobile_home_has_no_hamburger_drawer_trigger(self, browser, base_url: str):
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()
        try:
            page.goto(f"{base_url}/index.html", timeout=60000)
            page.wait_for_load_state("networkidle")

            expect(page.locator("label.mlad-hamburger")).to_have_count(0)
            assert page.locator(".md-nav--primary a.md-nav__link").count() == 0
        finally:
            context.close()
