"""
Creative canvas hero gating tests.

When the `creative_canvas` feature flag is ON, the landing page carries the
generative hero (markup + scripts). When OFF, no creative-canvas markup or
scripts are emitted. ON-state tests skip when the flag is off and vice versa,
so each configuration is validated against the current (flag-driven) build.
"""

import pytest
from playwright.sync_api import Page, expect

from ..shared.utils import creative_canvas_enabled


CREATIVE_CANVAS_SCRIPT = "creative-canvas/main.js"


def _page_scripts(page: Page) -> str:
    return page.evaluate("Array.from(document.scripts).map(s => s.src).join('\\n')")


def _canvas_metrics(page: Page) -> dict:
    return page.evaluate(
        """() => {
            const el = document.querySelector('.creative-canvas');
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            const styles = getComputedStyle(el);
            return {
                position: styles.position,
                pointerEvents: styles.pointerEvents,
                zIndex: styles.zIndex,
                backgroundImage: styles.backgroundImage,
                top: rect.top,
                left: rect.left,
                right: rect.right,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight,
                scrollY: window.scrollY
            };
        }"""
    )


@pytest.mark.skipif(not creative_canvas_enabled(), reason="creative canvas is disabled by feature flag")
class TestCreativeCanvasEnabled:
    """The generative hero should be present on the landing page."""

    def test_canvas_markup_present(self, page: Page, base_url: str):
        page.goto(base_url)
        expect(page.locator(".creative-canvas")).to_have_count(1)

    def test_canvas_scripts_loaded(self, page: Page, base_url: str):
        page.goto(base_url)
        scripts = _page_scripts(page)
        assert CREATIVE_CANVAS_SCRIPT in scripts

    def test_canvas_boots_a_sketch(self, page: Page, base_url: str):
        """The entry point should mount a live <canvas> for the visual."""
        page.goto(base_url)
        page.wait_for_selector(".creative-canvas__gl", timeout=5000)
        canvas = page.locator(".creative-canvas__gl").first
        expect(canvas).to_be_visible()

    def test_canvas_is_fixed_full_viewport_backdrop(self, page: Page, base_url: str):
        """The fallback gradient and live canvas share one full-viewport backdrop."""
        page.goto(base_url)
        metrics = _canvas_metrics(page)

        assert metrics is not None
        assert metrics["position"] == "fixed"
        assert metrics["pointerEvents"] == "none"
        assert metrics["top"] == 0
        assert metrics["left"] == 0
        assert metrics["width"] >= metrics["viewportWidth"] - 1
        assert metrics["height"] >= metrics["viewportHeight"] - 1
        assert metrics["backgroundImage"] != "none"

    def test_canvas_remains_present_at_footer(self, page: Page, base_url: str):
        """Scrolling to the footer should not reveal a cutoff below the backdrop."""
        page.goto(base_url)
        page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
        page.wait_for_timeout(100)

        footer = page.locator(".md-footer")
        expect(footer).to_be_visible()
        metrics = _canvas_metrics(page)

        assert metrics is not None
        assert metrics["scrollY"] > 0
        assert metrics["top"] == 0
        assert metrics["bottom"] >= metrics["viewportHeight"] - 1

    def test_home_shell_has_no_single_item_navigation_chrome(self, page: Page, base_url: str):
        """Home-only state should not render a lone Home tab or hamburger drawer."""
        page.goto(base_url)
        expect(page.locator(".md-tabs")).to_have_count(0)
        expect(page.locator("label.mlad-hamburger")).to_have_count(0)

    def test_home_has_no_horizontal_overflow(self, page: Page, base_url: str):
        page.goto(base_url)
        sizes = page.evaluate(
            """() => ({
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth
            })"""
        )
        assert sizes["scrollWidth"] <= sizes["clientWidth"] + 5, sizes


@pytest.mark.skipif(creative_canvas_enabled(), reason="creative canvas enabled; see ON-state tests")
class TestCreativeCanvasDisabled:
    """No creative-canvas markup or scripts should be emitted."""

    def test_canvas_markup_absent(self, page: Page, base_url: str):
        page.goto(base_url)
        expect(page.locator(".creative-canvas")).to_have_count(0)

    def test_canvas_scripts_absent(self, page: Page, base_url: str):
        page.goto(base_url)
        scripts = _page_scripts(page)
        assert "creative-canvas" not in scripts
