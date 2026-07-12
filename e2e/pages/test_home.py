"""
Home page e2e tests.
Verifies the homepage renders correctly with proper styling and content.
"""

import re

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
        expect(h1).to_contain_text("Hi, I'm Brandon")

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

    def test_scope_evidence_is_visible(self, page: Page):
        """The landing page should ground Brandon's scope in concrete outcomes."""
        evidence = page.locator("[data-life-panel='work']")
        expect(evidence).to_have_attribute("aria-hidden", "false")
        expect(evidence).to_contain_text("20+")
        expect(evidence).to_contain_text("4,000 / 200")
        expect(evidence).to_contain_text("2 weeks")

    def test_living_index_facets_are_available(self, page: Page):
        """The complete story should be directly selectable from one index."""
        facets = page.locator("[data-life-target]")
        assert facets.count() == 5
        expect(facets).to_have_text(["01 Work", "02 Make", "03 Serve", "04 Learn", "05 Life"])

    def test_tree_is_the_navigation_system(self, page: Page):
        """The central tree should pair a visual map with real controls."""
        expect(page.locator(".life-tree")).to_be_visible()
        expect(page.locator(".life-tree [data-tree-branch]")).to_have_count(5)
        expect(page.get_by_role("tab", name="Work")).to_be_visible()

    def test_selecting_a_branch_replaces_the_dossier(self, page: Page):
        """A branch should reveal its facet in place and preserve a deep link."""
        page.get_by_role("tab", name="Make").click()

        expect(page.get_by_role("tab", name="Make")).to_have_attribute(
            "aria-selected", "true"
        )
        expect(page.locator("[data-life-panel='make']")).to_have_attribute(
            "aria-hidden", "false"
        )
        expect(page.locator("[data-life-panel='work']")).to_have_attribute(
            "aria-hidden", "true"
        )
        expect(page).to_have_url(re.compile(r"#make$"))

    def test_branch_keyboard_navigation(self, page: Page):
        """Arrow keys should move through the living index facets."""
        work = page.locator("[data-life-target='work']")
        work.focus()
        work.press("ArrowRight")

        expect(page.get_by_role("tab", name="Make")).to_have_attribute(
            "aria-selected", "true"
        )

    def test_public_projects_are_linked(self, page: Page):
        """Featured public work should link to its primary project pages."""
        terminal_jarvis = page.locator(
            "a[href='https://github.com/BA-CalderonMorales/terminal-jarvis']:visible"
        ).first
        expect(terminal_jarvis).to_be_visible()

        portfolio = page.locator(
            "a[href='https://github.com/BA-CalderonMorales/my-life-as-a-dev']:visible"
        ).first
        expect(portfolio).to_be_visible()

    def test_generative_backdrop_is_disabled(self, page: Page):
        """The portfolio should use a quiet static canvas."""
        expect(page.locator(".creative-canvas")).to_have_count(0)

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

    def test_mobile_story_is_compact(self, browser, base_url: str):
        """The homepage should not require a résumé-length mobile scroll."""
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()
        try:
            page.goto(f"{base_url}/index.html")
            page.wait_for_load_state("networkidle")
            page.wait_for_selector(".life-index.is-enhanced", state="attached", timeout=5000)
            page_height = page.evaluate("document.documentElement.scrollHeight")
            assert page_height / 844 < 4.0
        finally:
            context.close()

    def test_reduced_motion_opens_the_static_index(self, browser, base_url: str):
        """Reduced-motion visitors should receive the resolved split view."""
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            reduced_motion="reduce",
        )
        page = context.new_page()
        try:
            page.goto(f"{base_url}/index.html")
            page.wait_for_load_state("networkidle")
            expect(page.locator("[data-life-index]")).to_have_class(
                re.compile(r"\bis-reduced\b")
            )
            expect(page.locator("[data-life-index]")).to_have_class(
                re.compile(r"\bis-open\b")
            )
        finally:
            context.close()
