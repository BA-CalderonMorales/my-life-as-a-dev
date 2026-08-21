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
        ("mobile-small", 320, 568),
        ("mobile-medium", 360, 800),
        ("mobile-standard", 390, 844),
        ("mobile-large", 430, 932),
        ("tablet", 768, 1024),
        ("desktop-flow-edge", 1024, 768),
        ("desktop", 1440, 900),
        ("wide", 1920, 1080),
    ]
    REQUIRED_VIEWPORT_SIZES = VIEWPORT_SIZES[:6]
    DESKTOP_TREE_VIEWPORT_SIZES = [
        ("desktop-transition", 1025, 768),
        *VIEWPORT_SIZES[6:],
    ]
    REDUCED_FLOW_VIEWPORT_SIZES = [
        VIEWPORT_SIZES[2],
        VIEWPORT_SIZES[4],
        VIEWPORT_SIZES[5],
    ]
    FACETS = ("work", "make", "serve", "learn", "life")

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

    def test_smallest_typography_keeps_words_intact(self, page_at_size):
        """The 320px composition should never split prominent words internally."""
        page = page_at_size(320, 568)
        metrics = page.evaluate(
            """() => {
                const wordLines = (selector, word) => {
                    const element = document.querySelector(selector);
                    const text = element.firstChild;
                    const start = text.data.indexOf(word);
                    const lines = [];
                    for (let index = start; index < start + word.length; index += 1) {
                        const range = document.createRange();
                        range.setStart(text, index);
                        range.setEnd(text, index + 1);
                        lines.push(Math.round(range.getBoundingClientRect().top));
                    }
                    return new Set(lines).size;
                };
                const heading = document.querySelector(".life-intro h1");
                return {
                    fontSize: Number.parseFloat(getComputedStyle(heading).fontSize),
                    heroWordLines: wordLines(".life-intro h1", "Brandon."),
                    contactWordLines: wordLines(".life-contact h2", "hello"),
                };
            }"""
        )

        assert metrics["fontSize"] <= 40.1
        assert metrics["heroWordLines"] == 1
        assert metrics["contactWordLines"] == 1

    @pytest.mark.parametrize("name,width,height", REQUIRED_VIEWPORT_SIZES)
    def test_flow_tree_and_facet_controls_are_contained(
        self, page_at_size, name: str, width: int, height: int
    ):
        """The full rooted SVG and focus rings should stay inside the flow layout."""
        page = page_at_size(width, height)
        metrics = page.evaluate(
            """() => {
                const rect = (element) => {
                    const box = element.getBoundingClientRect();
                    return {
                        left: box.left,
                        right: box.right,
                        top: box.top,
                        bottom: box.bottom,
                    };
                };
                const tree = document.querySelector(".life-tree");
                const roots = document.querySelector(".life-tree__roots");
                const controls = document.querySelector(".life-branches");
                return {
                    clientWidth: document.documentElement.clientWidth,
                    tree: rect(tree),
                    roots: rect(roots),
                    controls: rect(controls),
                };
            }"""
        )

        assert metrics["tree"]["left"] >= -1, f"{name}: tree clips on the left"
        assert metrics["tree"]["right"] <= metrics["clientWidth"] + 1, (
            f"{name}: tree clips on the right"
        )
        assert metrics["roots"]["left"] >= metrics["tree"]["left"] - 1, (
            f"{name}: roots escape the tree on the left"
        )
        assert metrics["roots"]["right"] <= metrics["tree"]["right"] + 1, (
            f"{name}: roots escape the tree on the right"
        )
        assert metrics["roots"]["bottom"] <= metrics["tree"]["bottom"] + 1, (
            f"{name}: roots escape the reserved tree height"
        )
        assert (
            metrics["roots"]["right"] - metrics["roots"]["left"]
            >= (metrics["tree"]["right"] - metrics["tree"]["left"]) * 0.93
        ), f"{name}: roots no longer span the tree footprint"
        assert (
            metrics["roots"]["bottom"] - metrics["roots"]["top"]
            >= (metrics["tree"]["right"] - metrics["tree"]["left"]) * 0.64
        ), f"{name}: roots no longer occupy meaningful vertical space"
        assert metrics["tree"]["bottom"] <= metrics["controls"]["top"] + 1, (
            f"{name}: roots overlap the visible facet controls"
        )

        for facet in (self.FACETS[0], self.FACETS[-1]):
            control = page.locator(f"[data-life-target='{facet}']")
            control.focus()
            focus_box = control.evaluate(
                """element => {
                    const box = element.getBoundingClientRect();
                    const style = getComputedStyle(element);
                    const reach =
                        parseFloat(style.outlineWidth || "0") +
                        parseFloat(style.outlineOffset || "0");
                    return {
                        left: box.left - reach,
                        right: box.right + reach,
                        clientWidth: document.documentElement.clientWidth,
                    };
                }"""
            )
            assert focus_box["left"] >= -1, f"{name}: {facet} focus ring clips left"
            assert focus_box["right"] <= focus_box["clientWidth"] + 1, (
                f"{name}: {facet} focus ring clips right"
            )

    @pytest.mark.parametrize("name,width,height", REQUIRED_VIEWPORT_SIZES)
    def test_primary_targets_meet_the_44px_floor(
        self, page_at_size, name: str, width: int, height: int
    ):
        """Visible navigation and contact targets should be at least 44 CSS pixels."""
        page = page_at_size(width, height)

        selectors = (
            "[data-life-target]",
            ".md-header [data-md-component='logo']",
            ".md-header [data-md-component='palette'] .md-header__button:not([hidden])",
            ".life-contact__actions a",
            ".mdlad-footer__links a",
        )
        for selector in selectors:
            boxes = page.locator(selector).evaluate_all(
                """elements => elements.map((element) => {
                    const box = element.getBoundingClientRect();
                    return {
                        label:
                            element.getAttribute("aria-label") ||
                            element.textContent.trim().replace(/\\s+/g, " "),
                        width: box.width,
                        height: box.height,
                    };
                })"""
            )
            assert boxes, f"{name}: expected targets for {selector}"
            for box in boxes:
                assert box["width"] >= 44, (
                    f"{name}: {box['label']} is only {box['width']:.1f}px wide"
                )
                assert box["height"] >= 44, (
                    f"{name}: {box['label']} is only {box['height']:.1f}px tall"
                )

        branch_targets = page.locator("[data-tree-branch]").evaluate_all(
            """elements => elements.map((element) => {
                const style = getComputedStyle(element);
                return {
                    facet: element.getAttribute("data-tree-branch"),
                    strokeWidth: parseFloat(style.strokeWidth),
                    vectorEffect: style.vectorEffect,
                };
            })"""
        )
        assert len(branch_targets) == 5
        for target in branch_targets:
            assert target["strokeWidth"] >= 44, (
                f"{name}: {target['facet']} SVG hit stroke is undersized"
            )
            assert target["vectorEffect"] == "non-scaling-stroke", (
                f"{name}: {target['facet']} hit stroke scales below its target size"
            )

    @pytest.mark.parametrize("name,width,height", REQUIRED_VIEWPORT_SIZES)
    def test_every_active_dossier_clears_the_coda(
        self, page_at_size, name: str, width: int, height: int
    ):
        """Every flow-layout dossier should contribute its full height before the coda."""
        page = page_at_size(width, height)

        for facet in self.FACETS:
            page.locator(f"[data-life-target='{facet}']").click()
            panel = page.locator(f"[data-life-panel='{facet}']")
            expect(panel).to_have_attribute("aria-hidden", "false")
            expect(panel).to_have_css("opacity", "1")
            bounds = panel.evaluate(
                """element => {
                    const panel = element.getBoundingClientRect();
                    const coda = document
                        .querySelector(".life-coda")
                        .getBoundingClientRect();
                    return {
                        panelBottom: panel.bottom + window.scrollY,
                        codaTop: coda.top + window.scrollY,
                    };
                }"""
            )
            assert bounds["panelBottom"] <= bounds["codaTop"] + 1, (
                f"{name}: {facet} dossier overlaps the coda by "
                f"{bounds['panelBottom'] - bounds['codaTop']:.1f}px"
            )

    def test_reference_mobile_story_stays_compact(self, page_at_size):
        """The complete 390px composition should remain under four viewport heights."""
        page = page_at_size(390, 844)
        page_height = page.evaluate("document.documentElement.scrollHeight")
        assert page_height / 844 < 4.0, (
            f"390x844 story is {page_height / 844:.3f} viewport heights"
        )

    def test_1024_uses_readable_flow_instead_of_the_sticky_split(self, page_at_size):
        """The 1024px edge should use natural flow, not the desktop sticky journey."""
        page = page_at_size(1024, 768)
        layout = page.evaluate(
            """() => {
                const stage = getComputedStyle(document.querySelector(".life-stage"));
                const dossiers = getComputedStyle(
                    document.querySelector(".life-dossiers")
                );
                return {
                    stagePosition: stage.position,
                    stageHeight: stage.height,
                    dossierPosition: dossiers.position,
                    scrollMarginTop: parseFloat(
                        getComputedStyle(
                            document.querySelector(".life-dossier.is-active")
                        ).scrollMarginTop
                    ),
                    headerHeight: document
                        .querySelector(".md-header")
                        .getBoundingClientRect().height,
                    dossierHeight:
                        document.querySelector(".life-dossiers").offsetHeight,
                    activeHeight:
                        document.querySelector(".life-dossier.is-active").offsetHeight,
                };
            }"""
        )

        assert layout["stagePosition"] == "relative"
        assert layout["stageHeight"] != "768px"
        assert layout["dossierPosition"] == "relative"
        assert abs(layout["dossierHeight"] - layout["activeHeight"]) <= 2
        assert layout["scrollMarginTop"] >= layout["headerHeight"]

    @pytest.mark.parametrize("name,width,height", DESKTOP_TREE_VIEWPORT_SIZES)
    def test_desktop_root_ink_stays_inside_the_stage(
        self, page_at_size, name: str, width: int, height: int
    ):
        """The tall desktop viewBox may overhang, but its painted roots must not."""
        page = page_at_size(width, height)
        bounds = page.evaluate(
            """() => {
                const stage = document
                    .querySelector(".life-stage")
                    .getBoundingClientRect();
                const roots = document
                    .querySelector(".life-tree__roots")
                    .getBoundingClientRect();
                return {
                    stageLeft: stage.left,
                    stageRight: stage.right,
                    stageBottom: stage.bottom,
                    rootLeft: roots.left,
                    rootRight: roots.right,
                    rootBottom: roots.bottom,
                    rootHeight: roots.height,
                    treeWidth: document
                        .querySelector(".life-tree")
                        .getBoundingClientRect().width,
                };
            }"""
        )

        assert bounds["rootLeft"] >= bounds["stageLeft"] - 1
        assert bounds["rootRight"] <= bounds["stageRight"] + 1
        assert bounds["rootBottom"] <= bounds["stageBottom"] + 1
        assert bounds["rootHeight"] >= bounds["treeWidth"] * 0.64

    def test_tree_motion_respects_the_reduced_motion_preference(
        self, browser, base_url: str
    ):
        """Normal mode has one ambient tree loop; reduced mode has none."""
        results = {}
        for preference in ("no-preference", "reduce"):
            context = browser.new_context(
                viewport={"width": 390, "height": 844},
                reduced_motion=preference,
            )
            page = context.new_page()
            try:
                page.goto(f"{base_url}/index.html")
                page.wait_for_load_state("networkidle")
                page.locator(".life-index").evaluate(
                    "element => element.style.setProperty('--life-roots', '0.25')"
                )
                results[preference] = page.evaluate(
                    """() => {
                        const animated = [...document.querySelectorAll(
                            ".life-tree *"
                        )].filter((element) => {
                            const style = getComputedStyle(element);
                            return (
                                style.animationName !== "none" &&
                                style.animationIterationCount === "infinite"
                            );
                        });
                        const firstRoot = document.querySelector(
                            ".life-tree__root--primary"
                        );
                        return {
                            animations: animated.map(
                                (element) => getComputedStyle(element).animationName
                            ),
                            rootDashOffset: parseFloat(
                                getComputedStyle(firstRoot).strokeDashoffset
                            ),
                        };
                    }"""
                )
            finally:
                context.close()

        assert results["no-preference"]["animations"] == ["life-tree-sway"]
        assert results["no-preference"]["rootDashOffset"] > 0
        assert results["reduce"]["animations"] == []
        assert results["reduce"]["rootDashOffset"] == 0

    @pytest.mark.parametrize("name,width,height", REDUCED_FLOW_VIEWPORT_SIZES)
    def test_reduced_motion_flow_keeps_all_content_reachable(
        self, browser, base_url: str, name: str, width: int, height: int
    ):
        """Reduced motion must not restore the clipped fixed-height journey."""
        context = browser.new_context(
            viewport={"width": width, "height": height},
            reduced_motion="reduce",
        )
        page = context.new_page()
        try:
            page.goto(f"{base_url}/index.html")
            page.wait_for_load_state("networkidle")

            for facet in self.FACETS:
                page.locator(f"[data-life-target='{facet}']").click()
                panel = page.locator(f"[data-life-panel='{facet}']")
                expect(panel).to_have_attribute("aria-hidden", "false")
                bounds = panel.evaluate(
                    """element => {
                        const journey = document
                            .querySelector(".life-journey")
                            .getBoundingClientRect();
                        const stage = document
                            .querySelector(".life-stage")
                            .getBoundingClientRect();
                        const panel = element.getBoundingClientRect();
                        const coda = document
                            .querySelector(".life-coda")
                            .getBoundingClientRect();
                        const footer = document
                            .querySelector(".md-footer")
                            .getBoundingClientRect();
                        return {
                            journeyHeight: journey.height,
                            stageHeight: stage.height,
                            panelBottom: panel.bottom + window.scrollY,
                            codaTop: coda.top + window.scrollY,
                            footerBottom: footer.bottom + window.scrollY,
                            pageHeight: document.documentElement.scrollHeight,
                        };
                    }"""
                )
                assert abs(bounds["journeyHeight"] - bounds["stageHeight"]) <= 1, (
                    f"{name}: reduced motion restored a fixed-height journey"
                )
                assert bounds["panelBottom"] <= bounds["codaTop"] + 1, (
                    f"{name}: reduced-motion {facet} dossier overlaps the coda"
                )
                assert bounds["footerBottom"] <= bounds["pageHeight"] + 1, (
                    f"{name}: footer is clipped from the document"
                )
        finally:
            context.close()

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
