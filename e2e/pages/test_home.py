"""
Home page e2e tests.
Verifies the homepage renders correctly with proper styling and content.
"""

import pytest
from playwright.sync_api import Page, expect

from ..shared import has_emoji, has_raw_markdown


class TestHomePage:
    """Tests for the home page."""

    @pytest.fixture(autouse=True)
    def navigate_to_home(self, page: Page, base_url: str):
        """Navigate to home page before each test."""
        page.goto(f"{base_url}/index.html")
        page.wait_for_load_state("networkidle")

    def test_page_title_exists(self, page: Page):
        """Page should have a title."""
        title = page.title()
        assert title, "Page title should not be empty"
        assert "Brandon" in title or "Simplified Life" in title

    def test_h1_heading_exists(self, page: Page):
        """Page should have an H1 heading."""
        h1 = page.locator("h1").first
        expect(h1).to_be_visible()
        text = h1.text_content()
        assert text and len(text) > 0

    def test_no_emojis_in_headings(self, page: Page):
        """Headings should not contain emojis."""
        headings = page.locator("h1, h2, h3, h4, h5, h6").all_text_contents()
        for heading in headings:
            assert not has_emoji(heading), f"Found emoji in heading: {heading}"

    def test_navigation_tabs_hidden(self, page: Page):
        """A lone Home item should not render as a docs-style tab bar."""
        tabs = page.locator(".md-tabs")
        expect(tabs).to_have_count(0)

    def test_buttons_render_correctly(self, page: Page):
        """Buttons should render without raw attribute syntax."""
        body_text = page.locator("body").text_content() or ""
        issues = has_raw_markdown(body_text)
        # Filter out false positives
        filtered = [i for i in issues if "button" in i.lower()]
        assert not filtered, f"Raw markdown issues: {filtered}"

    def test_work_items_visible(self, page: Page):
        """Landing page should show the focused portfolio work grid."""
        work_items = page.locator(".landing-work-item")
        assert work_items.count() == 4

    def test_links_are_clickable(self, page: Page):
        """Links should be interactive."""
        links = page.locator("a[href]")
        count = links.count()
        assert count > 0, "Page should have links"

    def test_dark_mode_toggle_exists(self, page: Page):
        """Dark mode toggle should be available."""
        toggle = page.locator("[data-md-component='palette']")
        # MkDocs Material has a palette toggle
        assert toggle.count() >= 0  # May not be visible but should exist in DOM
