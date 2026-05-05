"""
Canvas scene e2e tests.
Verifies the six previously broken canvas scenes render correctly
in both light and dark modes without console errors.
"""

import pytest
from playwright.sync_api import Page, expect


CANVAS_SCENES = [
    ("neon-geode", "Neon Geode"),
    ("magnetic-dust", "Magnetic Dust"),
    ("bismuth-fracture", "Bismuth Fracture"),
    ("digital-rain", "Digital Rain"),
    ("obsidian-shards", "Obsidian Shards"),
    ("holographic-sand", "Holographic Sand"),
]


class TestCanvasScenes:
    """Tests for individual canvas example pages."""

    @pytest.fixture(autouse=True)
    def navigate_to_canvas(self, page: Page, base_url: str):
        """Base fixture for canvas navigation."""
        self.page = page
        self.base_url = base_url

    def _go_to_scene(self, slug: str):
        """Navigate to a canvas scene and wait for load."""
        self.page.goto(f"{self.base_url}/canvas/{slug}/index.html")
        self.page.wait_for_load_state("networkidle")

    def _assert_scene_renders(self):
        """Common assertions that a canvas scene is rendering."""
        # Viewport container exists
        viewport = self.page.locator("#canvas-scene")
        expect(viewport).to_be_visible()

        # At least one canvas element was created inside the viewport
        canvas = viewport.locator("canvas").first
        expect(canvas).to_be_attached()

        # Canvas has non-zero dimensions
        box = canvas.bounding_box()
        assert box is not None, "Canvas should have a bounding box"
        assert box["width"] > 0, "Canvas width should be > 0"
        assert box["height"] > 0, "Canvas height should be > 0"

    @pytest.mark.parametrize("slug,title", CANVAS_SCENES)
    def test_scene_renders_in_light_mode(self, slug: str, title: str):
        """Each scene should render a visible canvas in light mode."""
        self._go_to_scene(slug)

        # Ensure light mode
        self.page.evaluate("""
            document.body.setAttribute('data-md-color-scheme', 'default');
            localStorage.setItem('__md_param', JSON.stringify({ palette: { color: { scheme: 'default' } } }));
        """)
        self.page.reload()
        self.page.wait_for_load_state("networkidle")

        self._assert_scene_renders()

    @pytest.mark.parametrize("slug,title", CANVAS_SCENES)
    def test_scene_renders_in_dark_mode(self, slug: str, title: str):
        """Each scene should render a visible canvas in dark mode."""
        self._go_to_scene(slug)

        # Ensure dark mode
        self.page.evaluate("""
            document.body.setAttribute('data-md-color-scheme', 'slate');
            localStorage.setItem('__md_param', JSON.stringify({ palette: { color: { scheme: 'slate' } } }));
        """)
        self.page.reload()
        self.page.wait_for_load_state("networkidle")

        self._assert_scene_renders()

    @pytest.mark.parametrize("slug,title", CANVAS_SCENES)
    def test_scene_has_no_app_errors(self, slug: str, title: str):
        """Each scene should not emit app-authored console errors."""
        errors = []

        def handle_console(msg):
            if msg.type == "error":
                text = msg.text
                # Filter out browser/extension errors and Three.js shader warnings
                if any(skip in text for skip in [
                    "Failed to load resource",
                    "net::ERR",
                    "WebGL",
                    "GL_",
                    "THREE.WebGLRenderer",
                    "extension",
                ]):
                    return
                errors.append(text)

        self.page.on("console", handle_console)
        self._go_to_scene(slug)

        # Give the scene a moment to initialize and run a few frames
        self.page.wait_for_timeout(500)

        assert not errors, f"Console errors on {slug}: {errors}"

    @pytest.mark.parametrize("slug,title", CANVAS_SCENES)
    def test_fullscreen_button_exists(self, slug: str, title: str):
        """Each canvas scene should have a fullscreen toggle button."""
        self._go_to_scene(slug)
        btn = self.page.locator("#canvas-fullscreen-toggle")
        expect(btn).to_be_visible()

    @pytest.mark.parametrize("slug,title", CANVAS_SCENES)
    def test_fullscreen_button_toggles(self, slug: str, title: str):
        """The fullscreen button should toggle the viewport fullscreen class."""
        self._go_to_scene(slug)
        btn = self.page.locator("#canvas-fullscreen-toggle")
        viewport = self.page.locator("#canvas-scene")

        expect(btn).to_be_visible()
        expect(viewport).not_to_have_class("is-fullscreen")

        btn.click()
        expect(viewport).to_have_class("is-fullscreen")

        btn.click()
        expect(viewport).not_to_have_class("is-fullscreen")
