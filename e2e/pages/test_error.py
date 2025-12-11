"""
404 error page e2e tests.
"""

import pytest
from playwright.sync_api import Page, expect


class TestErrorPage:
    """Tests for the 404 error page."""

    @pytest.fixture(autouse=True)
    def navigate_to_error(self, page: Page, base_url: str):
        """Navigate to 404 page before each test."""
        page.goto(f"{base_url}/404.html")
        page.wait_for_load_state("networkidle")

    def test_page_loads(self, page: Page):
        """404 page should load."""
        title = page.title()
        assert title, "Page title should not be empty"

    def test_error_message_visible(self, page: Page):
        """Error message should be visible."""
        body = page.locator("body")
        expect(body).to_be_visible()
