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
