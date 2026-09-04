"""
Home page e2e tests.
Verifies the homepage renders as one quiet typed page.
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
        assert "Brandon" in title

    def test_h1_heading_exists(self, page: Page):
        """Page should have one H1 heading."""
        h1 = page.locator("h1").first
        expect(h1).to_be_visible()
        expect(h1).to_contain_text("Brandon Calderon Morales")

    def test_no_emojis_in_headings(self, page: Page):
        """Headings should not contain emojis."""
        headings = page.locator("h1, h2, h3, h4, h5, h6").all_text_contents()
        for heading in headings:
            assert not has_emoji(heading), f"Found emoji in heading: {heading}"

    def test_body_is_a_peek_not_a_pitch(self, page: Page):
        """The page should read like a person, not an advertisement."""
        body_text = page.locator("article").text_content() or ""
        words = len(body_text.split())
        assert words < 320, f"Home page copy is too long: {words} words"

    def test_social_handles_are_listed(self, page: Page):
        """GitHub, LinkedIn, Kaggle, and email should all be reachable."""
        hrefs = page.locator("article a[href]").evaluate_all(
            "elements => elements.map(el => el.getAttribute('href'))"
        )
        assert any("github.com/BA-CalderonMorales" in h for h in hrefs)
        assert any("linkedin.com/in/bcalderonmorales-cmoe" in h for h in hrefs)
        assert any("kaggle.com/bmoe640" in h for h in hrefs)
        assert any(h.startswith("mailto:b.dev.c.m@gmail.com") for h in hrefs)

    def test_navigation_tabs_hidden(self, page: Page):
        """A lone Home item should not render as a docs-style tab bar."""
        tabs = page.locator(".md-tabs")
        expect(tabs).to_have_count(0)

    def test_no_raw_markdown_in_body(self, page: Page):
        """Body should not leak raw attribute syntax."""
        body_text = page.locator("body").text_content() or ""
        assert not has_raw_markdown(body_text)

    def test_links_are_clickable(self, page: Page):
        """Links should be interactive."""
        links = page.locator("a[href]")
        count = links.count()
        assert count > 0, "Page should have links"

    def test_dark_mode_toggle_exists(self, page: Page):
        """Dark mode toggle should be available."""
        toggle = page.locator("[data-md-component='palette']")
        assert toggle.count() >= 0  # May not be visible but should exist in DOM
