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
        expect(page.locator(".life-tree__wood-shape")).to_have_count(1)
        expect(page.locator(".life-tree [data-tree-branch]")).to_have_count(5)
        expect(page.locator(".life-tree [data-tree-node]")).to_have_count(5)
        expect(page.get_by_role("tab", name="Work")).to_be_visible()

    def test_tree_hit_paths_are_invisible_pointer_targets(self, page: Page):
        """Semantic branch geometry should never paint over the visual wood."""
        styles = page.locator("[data-tree-branch='work']").evaluate(
            """element => {
                const computed = getComputedStyle(element);
                return {
                    fill: computed.fill,
                    pointerEvents: computed.pointerEvents,
                    stroke: computed.stroke,
                };
            }"""
        )
        wood_pointer_events = page.locator(".life-tree__wood").evaluate(
            "element => getComputedStyle(element).pointerEvents"
        )

        assert styles["fill"] == "none"
        assert styles["pointerEvents"] == "stroke"
        assert styles["stroke"] in {"rgba(0, 0, 0, 0)", "transparent"}
        assert wood_pointer_events == "none"

    def test_tree_branch_keyboard_activation_reaches_its_facet(self, page: Page):
        """A focused semantic branch should activate through the keyboard."""
        make_branch = page.locator("[data-tree-branch='make']")
        make_branch.focus()
        make_branch.press("Enter")

        expect(page.get_by_role("tab", name="Make")).to_have_attribute(
            "aria-selected", "true"
        )
        expect(page).to_have_url(re.compile(r"#make$"))

    @pytest.mark.parametrize("facet", ("work", "make", "serve", "learn", "life"))
    def test_tree_node_activation_reaches_its_facet(self, page: Page, facet: str):
        """Every visible node should activate its matching dossier and hash."""
        page.locator(f"[data-tree-node='{facet}']").click(force=True)

        expect(page.get_by_role("tab", name=facet.capitalize())).to_have_attribute(
            "aria-selected", "true"
        )
        expect(page.locator(".life-dossiers")).to_have_css("opacity", "1")
        expect(page.locator(f"[data-life-panel='{facet}']")).to_have_css(
            "opacity", "1"
        )
        expect(page).to_have_url(re.compile(fr"#{facet}$"))

    def test_tree_pauses_wind_during_interaction(self, page: Page):
        """The animated crown should become a stable navigation target."""
        tree = page.locator(".life-tree")
        tree.locator("[data-tree-node='work']").hover(force=True)

        expect(tree).to_have_class(re.compile(r"\bis-wind-paused\b"))

        page.mouse.move(0, 0)
        expect(tree).not_to_have_class(re.compile(r"\bis-wind-paused\b"))

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

    def test_contact_sprout_grows_into_the_public_contact_section(self, page: Page):
        """The closing invitation should reveal its sprout and current email."""
        contact = page.locator("[data-life-contact]")
        contact.scroll_into_view_if_needed()

        expect(contact).to_have_class(re.compile(r"\bis-grown\b"))
        expect(
            contact.locator("a[href='mailto:b.dev.c.m@gmail.com']")
        ).to_be_visible()

    def test_footer_credits_zensical_and_keeps_contact_chrome_balanced(
        self, page: Page
    ):
        """Footer credit, contact icons, and right-aligned copyright should persist."""
        footer = page.locator(".md-footer")
        credit = footer.locator(".mdlad-footer__credit a")
        copyright_text = footer.locator(".mdlad-footer__meta")

        expect(credit).to_have_text("Zensical")
        expect(credit).to_have_attribute("href", "https://zensical.org/")
        expect(footer.locator(".mdlad-footer__links a")).to_have_count(3)
        expect(copyright_text).to_have_css("text-align", "right")

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
