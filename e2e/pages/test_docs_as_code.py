"""
Docs as Code page e2e tests.
"""

import pytest
from playwright.sync_api import Page, expect

from e2e.shared import has_emoji


class TestDocsAsCodePage:
    """Tests for the docs-as-code page."""

    @pytest.fixture(autouse=True)
    def navigate_to_docs_as_code(self, page: Page, base_url: str):
        """Navigate to docs-as-code page before each test."""
        page.goto(f"{base_url}/docs-as-code/index.html")
        page.wait_for_load_state("networkidle")

    def test_page_title_exists(self, page: Page):
        """Page should have a title."""
        title = page.title()
        assert title, "Page title should not be empty"

    def test_h1_heading_exists(self, page: Page):
        """Page should have an H1 heading."""
        h1 = page.locator("h1").first
        expect(h1).to_be_visible()

    def test_no_emojis_in_headings(self, page: Page):
        """Headings should not contain emojis."""
        headings = page.locator("h1, h2, h3, h4, h5, h6").all_text_contents()
        for heading in headings:
            assert not has_emoji(heading), f"Found emoji in heading: {heading}"
