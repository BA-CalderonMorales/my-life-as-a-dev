"""
Resume page e2e tests.
"""

import pytest
from playwright.sync_api import Page, expect

from ..shared import has_emoji
from ..shared.utils import section_archived


@pytest.mark.skipif(section_archived("resume"), reason="Resume section is archived/off")
class TestResumePage:
    """Tests for the resume page."""

    @pytest.fixture(autouse=True)
    def navigate_to_resume(self, page: Page, base_url: str):
        """Navigate to resume page before each test."""
        page.goto(f"{base_url}/resume/index.html")
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

    def test_contact_info_visible(self, page: Page):
        """Contact information should be visible."""
        # Resume should have email/LinkedIn links
        contact_links = page.locator("a[href*='mailto'], a[href*='linkedin']")
        count = contact_links.count()
        assert count > 0, "Expected contact links on resume"
