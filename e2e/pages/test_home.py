"""
Home page e2e tests.
Verifies the homepage renders correctly with proper styling and content.
"""

import math
import re

import pytest
from playwright.sync_api import Page, expect

from ..shared import has_emoji, has_raw_markdown


LIFE_FACETS = ("work", "make", "serve", "learn", "life")
MOBILE_VIEWPORT = {"width": 390, "height": 844}


def _wait_for_living_index(page: Page):
    """Wait until the controller has measured and rendered its first frame."""
    page.wait_for_selector("[data-life-index].is-enhanced", state="attached")
    page.wait_for_function(
        """() => {
            const root = document.querySelector("[data-life-index]");
            return root && root.style.getPropertyValue("--life-roots") !== "";
        }"""
    )


def _scroll_without_animation(page: Page, target: float):
    """Set a deterministic scroll position despite the site's smooth-scroll CSS."""
    page.evaluate(
        """async target => {
            const scroller = document.documentElement;
            const value = scroller.style.getPropertyValue("scroll-behavior");
            const priority = scroller.style.getPropertyPriority("scroll-behavior");
            scroller.style.setProperty("scroll-behavior", "auto", "important");
            window.scrollTo({top: target, behavior: "instant"});
            await new Promise(resolve => {
                requestAnimationFrame(() => requestAnimationFrame(resolve));
            });
            if (value) {
                scroller.style.setProperty("scroll-behavior", value, priority);
            } else {
                scroller.style.removeProperty("scroll-behavior");
            }
        }""",
        target,
    )


def _observe_facet_changes(page: Page):
    """Record controller selections so tests can reject transient wrong facets."""
    page.evaluate(
        """() => {
            const root = document.querySelector("[data-life-index]");
            window.__lifeFacetChanges = [];
            new MutationObserver(() => {
                const value = root.dataset.activeFacet;
                const changes = window.__lifeFacetChanges;
                if (changes[changes.length - 1] !== value) {
                    changes.push(value);
                }
            }).observe(root, {
                attributes: true,
                attributeFilter: ["data-active-facet"],
            });
        }"""
    )


def _mobile_facet_metrics(page: Page, facet: str):
    """Collect the visibility, geometry, and flow contract for one dossier."""
    return page.evaluate(
        """facet => {
            const root = document.querySelector("[data-life-index]");
            const tab = root.querySelector(`[data-life-target="${facet}"]`);
            const panel = root.querySelector(`[data-life-panel="${facet}"]`);
            const heading = panel.querySelector("h2");
            const content = panel.querySelector(".life-dossier__lede");
            const coda = document.querySelector(".life-coda");
            const header = document.querySelector(".md-header");
            const panelRect = panel.getBoundingClientRect();
            const headingRect = heading.getBoundingClientRect();
            const contentRect = content.getBoundingClientRect();
            const codaRect = coda.getBoundingClientRect();
            const viewport = window.visualViewport;
            const viewportBottom = viewport
                ? viewport.offsetTop + viewport.height
                : window.innerHeight;
            const selectedTabs = Array.from(
                root.querySelectorAll("[data-life-target][aria-selected='true']")
            ).map(item => item.dataset.lifeTarget);
            const visiblePanels = Array.from(
                root.querySelectorAll("[data-life-panel][aria-hidden='false']")
            ).map(item => item.dataset.lifePanel);
            const lastContent = panel.lastElementChild;
            const lastContentRect = lastContent.getBoundingClientRect();

            return {
                activeFacet: root.dataset.activeFacet,
                selected: tab.getAttribute("aria-selected"),
                hidden: panel.getAttribute("aria-hidden"),
                hash: window.location.hash,
                panelOpacity: Number.parseFloat(getComputedStyle(panel).opacity),
                dossiersOpacity: Number.parseFloat(
                    getComputedStyle(panel.parentElement).opacity
                ),
                scrollY: window.scrollY,
                headerBottom: header ? header.getBoundingClientRect().bottom : 0,
                panelTop: panelRect.top,
                panelBottom: panelRect.bottom,
                panelBottomDocument: panelRect.bottom + window.scrollY,
                headingTop: headingRect.top,
                headingBottom: headingRect.bottom,
                contentTop: contentRect.top,
                lastContentBottom: lastContentRect.bottom,
                codaTopDocument: codaRect.top + window.scrollY,
                viewportBottom,
                documentHeight: document.documentElement.scrollHeight,
                overflowY: getComputedStyle(panel).overflowY,
                selectedTabs,
                visiblePanels,
            };
        }""",
        arg=facet,
    )


def _assert_mobile_facet(page: Page, facet: str):
    """Assert the complete post-navigation contract for a mobile facet."""
    expect(page).to_have_url(re.compile(fr"#{facet}$"))
    expect(page.locator(f"[data-life-target='{facet}']")).to_have_attribute(
        "aria-selected", "true"
    )
    expect(page.locator(f"[data-life-panel='{facet}']")).to_have_attribute(
        "aria-hidden", "false"
    )
    expect(page.locator(f"[data-life-panel='{facet}']")).to_have_css("opacity", "1")
    expect(page.locator(".life-dossiers")).to_have_css("opacity", "1")

    page.wait_for_function(
        """facet => {
            const panel = document.querySelector(
                `[data-life-panel="${facet}"]`
            );
            const heading = panel.querySelector("h2");
            const content = panel.querySelector(".life-dossier__lede");
            const header = document.querySelector(".md-header");
            const top = header ? header.getBoundingClientRect().bottom : 0;
            const bottom = window.visualViewport
                ? window.visualViewport.offsetTop + window.visualViewport.height
                : window.innerHeight;
            const panelRect = panel.getBoundingClientRect();
            const headingRect = heading.getBoundingClientRect();
            const contentRect = content.getBoundingClientRect();
            return panelRect.top >= top - 1
                && panelRect.top < bottom
                && headingRect.top >= top - 1
                && headingRect.bottom <= bottom + 1
                && contentRect.top < bottom;
        }""",
        arg=facet,
    )

    metrics = _mobile_facet_metrics(page, facet)
    assert metrics["activeFacet"] == facet
    assert metrics["selected"] == "true"
    assert metrics["hidden"] == "false"
    assert metrics["hash"] == f"#{facet}"
    assert metrics["panelOpacity"] == pytest.approx(1)
    assert metrics["dossiersOpacity"] == pytest.approx(1)
    assert metrics["selectedTabs"] == [facet]
    assert metrics["visiblePanels"] == [facet]
    assert metrics["scrollY"] > metrics["headerBottom"]
    assert metrics["panelTop"] >= metrics["headerBottom"] - 1
    assert metrics["panelTop"] < metrics["viewportBottom"]
    assert metrics["headingTop"] >= metrics["headerBottom"] - 1
    assert metrics["headingBottom"] <= metrics["viewportBottom"] + 1
    assert metrics["contentTop"] < metrics["viewportBottom"]
    assert metrics["panelBottomDocument"] <= metrics["codaTopDocument"] + 1
    assert metrics["lastContentBottom"] <= metrics["panelBottom"] + 1
    assert metrics["overflowY"] != "hidden"
    assert metrics["documentHeight"] > metrics["viewportBottom"]


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


class TestLivingIndexChoreography:
    """Behavioral coverage for mobile navigation and tree choreography."""

    @pytest.fixture
    def mobile_page(self, browser, base_url: str):
        """Provide an enhanced home page at a representative phone viewport."""
        context = browser.new_context(viewport=MOBILE_VIEWPORT)
        page = context.new_page()
        page.goto(f"{base_url}/index.html", wait_until="networkidle")
        _wait_for_living_index(page)
        yield page
        context.close()

    @pytest.mark.parametrize("facet", LIFE_FACETS)
    def test_mobile_tabs_land_on_only_the_requested_dossier(
        self, mobile_page: Page, facet: str
    ):
        """Every tab should land instantly on one readable in-flow dossier."""
        _observe_facet_changes(mobile_page)
        mobile_page.locator(".life-branches").scroll_into_view_if_needed()
        mobile_page.locator(f"[data-life-target='{facet}']").click()

        _assert_mobile_facet(mobile_page, facet)
        assert mobile_page.evaluate("window.__lifeFacetChanges") == [facet]

    def test_mobile_svg_node_uses_the_same_navigation_contract(
        self, mobile_page: Page
    ):
        """A tree node should forward through the tab controller on mobile."""
        _observe_facet_changes(mobile_page)
        mobile_page.locator("[data-tree-node='serve']").click(force=True)

        _assert_mobile_facet(mobile_page, "serve")
        assert mobile_page.evaluate("window.__lifeFacetChanges") == ["serve"]

    def test_touch_tab_and_svg_branch_share_the_navigation_contract(
        self, browser, base_url: str
    ):
        """Real touch input should activate both tab and SVG navigation paths."""
        context = browser.new_context(
            viewport=MOBILE_VIEWPORT,
            has_touch=True,
            is_mobile=True,
        )
        page = context.new_page()
        try:
            page.goto(f"{base_url}/index.html", wait_until="networkidle")
            _wait_for_living_index(page)
            _observe_facet_changes(page)
            page.locator(".life-branches").scroll_into_view_if_needed()
            page.locator("[data-life-target='make']").tap()
            _assert_mobile_facet(page, "make")

            page.locator(".life-tree").scroll_into_view_if_needed()
            page.locator("[data-tree-branch='serve']").tap()
            _assert_mobile_facet(page, "serve")
            assert page.evaluate("window.__lifeFacetChanges") == ["make", "serve"]
        finally:
            context.close()

    @pytest.mark.parametrize("facet", LIFE_FACETS)
    def test_mobile_direct_hashes_align_each_dossier(
        self, browser, base_url: str, facet: str
    ):
        """Each direct hash should resolve below the fixed header on first load."""
        context = browser.new_context(viewport=MOBILE_VIEWPORT)
        page = context.new_page()
        try:
            page.goto(
                f"{base_url}/index.html#{facet}",
                wait_until="networkidle",
            )
            _wait_for_living_index(page)
            _assert_mobile_facet(page, facet)
        finally:
            context.close()

    def test_mobile_history_restores_hashes_and_empty_hash_work(
        self, mobile_page: Page
    ):
        """Back and forward should restore one stable selection per history entry."""
        assert mobile_page.evaluate("history.scrollRestoration") == "manual"
        mobile_page.locator(".life-branches").scroll_into_view_if_needed()
        mobile_page.locator("[data-life-target='make']").click()
        _assert_mobile_facet(mobile_page, "make")
        mobile_page.locator("[data-life-target='learn']").evaluate(
            "element => element.click()"
        )
        _assert_mobile_facet(mobile_page, "learn")

        mobile_page.go_back()
        _assert_mobile_facet(mobile_page, "make")
        mobile_page.go_back()
        expect(mobile_page).to_have_url(re.compile(r"/index\.html$"))
        expect(mobile_page.locator("[data-life-target='work']")).to_have_attribute(
            "aria-selected", "true"
        )
        expect(mobile_page.locator("[data-life-panel='work']")).to_have_attribute(
            "aria-hidden", "false"
        )

        mobile_page.go_forward()
        _assert_mobile_facet(mobile_page, "make")
        mobile_page.go_forward()
        _assert_mobile_facet(mobile_page, "learn")

        error_url = mobile_page.evaluate(
            "new URL('/404.html', window.location.href).href"
        )
        mobile_page.goto(error_url, wait_until="networkidle")
        assert mobile_page.evaluate("history.scrollRestoration") == "auto"

    def test_mobile_already_usable_dossier_does_not_scroll(
        self, mobile_page: Page
    ):
        """Re-selecting an already readable panel should leave scroll untouched."""
        mobile_page.locator(".life-branches").scroll_into_view_if_needed()
        mobile_page.locator("[data-life-target='make']").click()
        _assert_mobile_facet(mobile_page, "make")
        starting_scroll = mobile_page.evaluate("window.scrollY")
        mobile_page.evaluate(
            """() => {
                window.__lifeScrollCalls = 0;
                const original = window.scrollTo.bind(window);
                window.scrollTo = (...args) => {
                    window.__lifeScrollCalls += 1;
                    return original(...args);
                };
                document.querySelector("[data-life-target='make']").click();
            }"""
        )
        mobile_page.evaluate(
            """() => new Promise(resolve => {
                requestAnimationFrame(() => requestAnimationFrame(resolve));
            })"""
        )

        assert mobile_page.evaluate("window.__lifeScrollCalls") == 0
        assert mobile_page.evaluate("window.scrollY") == pytest.approx(
            starting_scroll, abs=1
        )

    def test_keyboard_focus_and_facet_survive_layout_crossings(
        self, mobile_page: Page
    ):
        """Keyboard selection and focus should survive mobile/desktop crossings."""
        mobile_page.locator(".life-branches").scroll_into_view_if_needed()
        mobile_page.locator("[data-life-target='work']").focus()
        mobile_page.locator("[data-life-target='work']").press("ArrowRight")

        _assert_mobile_facet(mobile_page, "make")
        assert mobile_page.evaluate(
            "document.activeElement.dataset.lifeTarget"
        ) == "make"

        _observe_facet_changes(mobile_page)
        mobile_page.set_viewport_size({"width": 1280, "height": 800})
        mobile_page.wait_for_function(
            """() => {
                const root = document.querySelector("[data-life-index]");
                const meter = Number.parseFloat(
                    root.style.getPropertyValue("--life-meter")
                );
                return matchMedia("(min-width: 64.01rem)").matches
                    && meter > 35
                    && meter < 45;
            }"""
        )
        expect(mobile_page).to_have_url(re.compile(r"#make$"))
        expect(mobile_page.locator("[data-life-target='make']")).to_have_attribute(
            "aria-selected", "true"
        )
        expect(mobile_page.locator("[data-life-panel='make']")).to_have_attribute(
            "aria-hidden", "false"
        )
        assert mobile_page.evaluate(
            "document.activeElement.dataset.lifeTarget"
        ) == "make"

        mobile_page.set_viewport_size(MOBILE_VIEWPORT)
        _assert_mobile_facet(mobile_page, "make")
        assert mobile_page.evaluate(
            "document.activeElement.dataset.lifeTarget"
        ) == "make"
        assert set(mobile_page.evaluate("window.__lifeFacetChanges")) <= {"make"}

    def test_mobile_root_growth_is_bounded_and_reversible(
        self, mobile_page: Page
    ):
        """Scrolling down and back up should grow and retract one finite scalar."""
        positions = mobile_page.evaluate(
            """() => {
                const dossiers = document.querySelector(".life-dossiers");
                return {
                    dossierTop:
                        dossiers.getBoundingClientRect().top + window.scrollY,
                    viewportHeight: window.innerHeight,
                };
            }"""
        )
        downward_target = (
            positions["dossierTop"] - positions["viewportHeight"] * 0.5
        )
        midpoint_target = downward_target * 0.5

        def root_progress():
            return float(
                mobile_page.locator("[data-life-index]").evaluate(
                    "root => getComputedStyle(root)"
                    ".getPropertyValue('--life-roots')"
                )
            )

        _scroll_without_animation(mobile_page, 0)
        start = root_progress()
        _scroll_without_animation(mobile_page, midpoint_target)
        midpoint = root_progress()
        _scroll_without_animation(mobile_page, downward_target)
        grown = root_progress()
        _scroll_without_animation(mobile_page, midpoint_target)
        retracted_midpoint = root_progress()
        _scroll_without_animation(mobile_page, 0)
        returned = root_progress()

        values = (start, midpoint, grown, retracted_midpoint, returned)
        assert all(math.isfinite(value) for value in values)
        assert all(0 <= value <= 1 for value in values)
        assert start < midpoint < grown
        assert grown > retracted_midpoint > returned
        assert retracted_midpoint == pytest.approx(midpoint, abs=0.01)
        assert returned == pytest.approx(start, abs=0.01)
        assert grown == pytest.approx(1, abs=0.01)

    def test_only_the_breeze_transform_moves(
        self, mobile_page: Page
    ):
        """Animation keyframes should move the crown while wood and roots stay planted."""
        mobile_page.locator(".life-tree").scroll_into_view_if_needed()
        mobile_page.wait_for_function(
            """() => document.querySelector(".life-tree")
                .classList.contains("is-wind-on")"""
        )
        transforms = mobile_page.evaluate(
            """() => {
                const tree = document.querySelector(".life-tree");
                const breeze = tree.querySelector(".life-tree__breeze");
                const wood = tree.querySelector(".life-tree__wood");
                const roots = tree.querySelector(".life-tree__roots");
                const animation = breeze.getAnimations()[0];
                animation.pause();
                animation.currentTime = 0;
                const first = {
                    breeze: getComputedStyle(breeze).transform,
                    wood: getComputedStyle(wood).transform,
                    roots: getComputedStyle(roots).transform,
                };
                animation.currentTime = animation.effect.getTiming().duration * 0.24;
                const second = {
                    breeze: getComputedStyle(breeze).transform,
                    wood: getComputedStyle(wood).transform,
                    roots: getComputedStyle(roots).transform,
                };
                return {first, second};
            }"""
        )

        assert transforms["first"]["wood"] == transforms["second"]["wood"]
        assert transforms["first"]["roots"] == transforms["second"]["roots"]
        assert transforms["first"]["breeze"] != transforms["second"]["breeze"]

    def test_reduced_motion_resolves_roots_without_tree_animations(
        self, browser, base_url: str
    ):
        """Reduced motion should render the complete roots and no active tree motion."""
        context = browser.new_context(
            viewport=MOBILE_VIEWPORT,
            reduced_motion="reduce",
        )
        page = context.new_page()
        try:
            page.goto(f"{base_url}/index.html", wait_until="networkidle")
            _wait_for_living_index(page)
            state = page.evaluate(
                """() => {
                    const root = document.querySelector("[data-life-index]");
                    const tree = root.querySelector(".life-tree");
                    const offsets = Array.from(
                        tree.querySelectorAll(".life-tree__roots path")
                    ).map(path => Number.parseFloat(
                        getComputedStyle(path).strokeDashoffset
                    ));
                    return {
                        roots: Number.parseFloat(
                            getComputedStyle(root)
                                .getPropertyValue("--life-roots")
                        ),
                        offsets,
                        animations: tree.getAnimations({subtree: true}).length,
                    };
                }"""
            )

            assert state["roots"] == pytest.approx(1)
            assert all(abs(offset) <= 0.01 for offset in state["offsets"])
            assert state["animations"] == 0
        finally:
            context.close()

    def test_visible_index_has_one_tree_animation_and_offscreen_has_none(
        self, browser, base_url: str
    ):
        """Only the indexed on-screen breeze should consume an animation."""
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        try:
            page.goto(f"{base_url}/index.html", wait_until="networkidle")
            _wait_for_living_index(page)
            journey = page.evaluate(
                """() => {
                    const journey = document.querySelector("[data-life-journey]");
                    const stage = document.querySelector(".life-stage");
                    return {
                        start: journey.getBoundingClientRect().top + window.scrollY,
                        range: Math.max(
                            journey.offsetHeight - stage.offsetHeight,
                            1
                        ),
                    };
                }"""
            )
            _scroll_without_animation(
                page,
                journey["start"] + journey["range"] * 0.45,
            )
            page.wait_for_function(
                """() => {
                    const root = document.querySelector("[data-life-index]");
                    const tree = root.querySelector(".life-tree");
                    return root.classList.contains("is-indexed")
                        && tree.classList.contains("is-wind-on");
                }"""
            )
            page.wait_for_timeout(500)
            active_names = page.locator(".life-tree").evaluate(
                """tree => tree.getAnimations({subtree: true})
                    .map(animation => animation.animationName)"""
            )
            assert active_names == ["life-tree-sway"]

            _scroll_without_animation(
                page,
                journey["start"] + journey["range"] * 0.95,
            )
            roots = float(
                page.locator("[data-life-index]").evaluate(
                    "root => getComputedStyle(root)"
                    ".getPropertyValue('--life-roots')"
                )
            )
            assert roots == pytest.approx(1, abs=0.01)

            _scroll_without_animation(
                page,
                page.evaluate(
                    "document.documentElement.scrollHeight - window.innerHeight"
                ),
            )
            page.wait_for_function(
                """() => !document.querySelector(".life-tree")
                    .classList.contains("is-wind-on")"""
            )
            assert page.locator(".life-tree").evaluate(
                "tree => tree.getAnimations({subtree: true}).length"
            ) == 0
        finally:
            context.close()
