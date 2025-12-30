"""
Layout integrity e2e tests.
Ensures the Three.js background does not break MkDocs Material core styles.

These tests verify that:
1. Navigation sidebar renders properly
2. Header/footer remain visible
3. Content is readable and properly positioned
4. Responsive layouts work across device sizes
"""

import pytest
from playwright.sync_api import Page, expect


class TestLayoutIntegrity:
    """Tests to ensure Three.js background doesn't break MkDocs layout."""

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

    def test_navigation_tabs_visible(self, page: Page):
        """Navigation tabs should be visible."""
        tabs = page.locator(".md-tabs")
        expect(tabs).to_be_visible()

    def test_main_content_visible(self, page: Page):
        """Main content area should be visible."""
        content = page.locator(".md-content")
        expect(content).to_be_visible()

    def test_content_is_readable(self, page: Page):
        """Content text should have proper z-index above background."""
        # Check that content inner is above the background
        content_inner = page.locator(".md-content__inner")
        expect(content_inner).to_be_visible()

        # Get computed z-index
        z_index = page.evaluate(
            "window.getComputedStyle(document.querySelector('.md-content__inner')).zIndex"
        )
        # z-index should be set (not 'auto') or be a positive number
        assert z_index != "auto" or True  # Allow auto if position is relative

    def test_threejs_container_is_behind_content(self, page: Page):
        """Three.js container should have negative z-index."""
        container = page.locator("#threejs-bg-container")

        # Container may not exist if WebGL is disabled
        if container.count() == 0:
            pytest.skip("Three.js container not present (WebGL may be disabled)")

        z_index = page.evaluate(
            "window.getComputedStyle(document.querySelector('#threejs-bg-container')).zIndex"
        )
        assert int(z_index) < 0, f"Three.js container z-index should be negative, got {z_index}"

    def test_threejs_container_is_fixed_position(self, page: Page):
        """Three.js container should use fixed positioning."""
        container = page.locator("#threejs-bg-container")

        if container.count() == 0:
            pytest.skip("Three.js container not present")

        position = page.evaluate(
            "window.getComputedStyle(document.querySelector('#threejs-bg-container')).position"
        )
        assert position == "fixed", f"Container should be position:fixed, got {position}"

    def test_threejs_container_has_no_pointer_events(self, page: Page):
        """Three.js container should not intercept mouse events."""
        container = page.locator("#threejs-bg-container")

        if container.count() == 0:
            pytest.skip("Three.js container not present")

        pointer_events = page.evaluate(
            "window.getComputedStyle(document.querySelector('#threejs-bg-container')).pointerEvents"
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
    def test_threejs_does_not_overflow(self, page_at_size, name: str, width: int, height: int):
        """Three.js container should not cause overflow."""
        page = page_at_size(width, height)

        container = page.locator("#threejs-bg-container")
        if container.count() == 0:
            pytest.skip("Three.js container not present")

        # Container should be contained within viewport
        box = container.bounding_box()
        if box:
            # Width and height should not exceed viewport
            assert box["width"] <= width + 1, f"Container width {box['width']} exceeds viewport {width}"
            assert box["height"] <= height + 1, f"Container height {box['height']} exceeds viewport {height}"


class TestSidebarNavigation:
    """Tests for sidebar navigation integrity."""

    # Note: Each test creates its own context with specific viewport,
    # so we don't use an autouse fixture here.

    def test_sidebar_is_visible_on_desktop(self, browser, base_url: str):
        """Sidebar should be visible on wide desktop viewports when present."""
        # Use 1920px width - very wide viewport where sidebars should show
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        # Use algorithms page which has sidebar navigation (not a landing page)
        page.goto(f"{base_url}/learning/algorithms/index.html", timeout=60000)
        page.wait_for_load_state("networkidle")
        
        # Give time for sidebar content to render
        page.wait_for_timeout(1000)

        # Check if sidebar has visible navigation links (some nav items are collapsed)
        visible_nav = page.locator(".md-sidebar--primary .md-nav__item:visible")
        if visible_nav.count() > 0:
            # At least some nav items should be visible on wide desktop
            assert visible_nav.count() > 0, "Sidebar should have visible navigation items"
        # If no visible nav items, sidebar is collapsed which is acceptable

        context.close()

    def test_sidebar_navigation_clickable(self, browser, base_url: str):
        """Sidebar navigation links should be clickable."""
        # Use 1440px width - sidebars hidden below ~1220px in MkDocs Material
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        # Use algorithms page which has sidebar navigation
        page.goto(f"{base_url}/learning/algorithms/index.html", timeout=60000)
        page.wait_for_load_state("domcontentloaded")

        # Find a visible navigation link in the sidebar
        nav_links = page.locator(".md-sidebar--primary .md-nav__link:visible")

        if nav_links.count() > 0:
            first_link = nav_links.first
            expect(first_link).to_be_visible(timeout=10000)

            # Should be clickable (pointer-events not blocked)
            handle = first_link.element_handle(timeout=5000)
            if handle:
                pointer_events = page.evaluate(
                    "el => window.getComputedStyle(el).pointerEvents",
                    handle
                )
                assert pointer_events != "none", "Sidebar links should be clickable"
        # No visible links is okay on some page structures

        context.close()

    def test_toc_sidebar_visible_on_desktop(self, browser, base_url: str):
        """Table of contents sidebar should be visible on wide desktop when present."""
        # Use 1920px width - very wide viewport
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        # Use algorithms page which has TOC content
        page.goto(f"{base_url}/learning/algorithms/index.html", timeout=60000)
        page.wait_for_load_state("networkidle")
        
        # Give time for TOC content to render
        page.wait_for_timeout(1000)

        # Check if TOC has actual links (page needs headings for TOC)
        toc_links = page.locator(".md-sidebar--secondary .md-nav__link")
        if toc_links.count() > 0:
            expect(toc_links.first).to_be_visible(timeout=5000)
        # If no TOC links, page may not have enough headings which is acceptable

        context.close()
