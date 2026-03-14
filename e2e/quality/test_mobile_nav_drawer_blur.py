"""
Mobile navigation drawer regression tests.

These tests use headless Chrome directly so they can run in sandboxed
environments where the Playwright package is unavailable. They verify that:
1. The open mobile drawer stays above the overlay instead of being blurred by it
2. The overlay still owns the backdrop blur outside the drawer
"""

import html
import json
import re
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
SITE_ROOT = PROJECT_ROOT / "site"
MOBILE_PAGE = Path("learning/algorithms/index.html")
CHROME_BINARY = (
    shutil.which("google-chrome")
    or shutil.which("chromium")
    or shutil.which("chromium-browser")
)


def _build_probe_document(page_path: Path) -> str:
    source = page_path.read_text(encoding="utf-8")
    base_href = f"{page_path.parent.as_uri()}/"

    # The drawer state is CSS-driven, so we can remove runtime scripts and
    # still exercise the actual built markup and styles.
    source = re.sub(r"<script\b[^>]*>.*?</script>", "", source, flags=re.IGNORECASE | re.DOTALL)
    source = source.replace("<head>", f'<head>\n<base href="{base_href}">\n', 1)
    source = source.replace(
        'id="__drawer" autocomplete="off">',
        'id="__drawer" autocomplete="off" checked>',
        1,
    )

    probe_script = """
<script>
document.addEventListener("DOMContentLoaded", function () {
  requestAnimationFrame(function () {
    setTimeout(function () {
      var drawerInput = document.getElementById("__drawer");
      if (drawerInput) drawerInput.checked = true;

      var sidebar = document.querySelector(".md-sidebar--primary");
      var overlay = document.querySelector(".md-overlay");
      var container = document.querySelector(".md-container");
      var main = document.querySelector(".md-main");

      function styleValue(node, property) {
        if (!node) return null;
        var value = getComputedStyle(node)[property];
        return value === undefined ? null : value;
      }

      function classifyTopNode(node) {
        if (!node) return null;
        if (node.closest(".md-overlay")) return ".md-overlay";
        if (node.closest(".md-sidebar--primary")) return ".md-sidebar--primary";
        return node.tagName.toLowerCase();
      }

      var result = {
        drawerChecked: !!drawerInput && drawerInput.checked,
        insideDrawerTop: classifyTopNode(document.elementFromPoint(60, 120)),
        outsideDrawerTop: classifyTopNode(document.elementFromPoint(window.innerWidth - 32, 120)),
        sidebar: {
          backdropFilter: styleValue(sidebar, "backdropFilter"),
          webkitBackdropFilter: styleValue(sidebar, "webkitBackdropFilter"),
          backgroundColor: styleValue(sidebar, "backgroundColor"),
          zIndex: styleValue(sidebar, "zIndex")
        },
        overlay: {
          backdropFilter: styleValue(overlay, "backdropFilter"),
          webkitBackdropFilter: styleValue(overlay, "webkitBackdropFilter"),
          backgroundColor: styleValue(overlay, "backgroundColor"),
          opacity: styleValue(overlay, "opacity"),
          zIndex: styleValue(overlay, "zIndex")
        },
        container: {
          zIndex: styleValue(container, "zIndex")
        },
        main: {
          zIndex: styleValue(main, "zIndex")
        }
      };

      document.body.innerHTML = '<pre id="probe-output"></pre>';
      document.getElementById("probe-output").textContent = JSON.stringify(result);
    }, 200);
  });
});
</script>
"""

    return source.replace("</body>", f"{probe_script}\n</body>", 1)


def _render_mobile_drawer_state() -> dict[str, object]:
    if not CHROME_BINARY:
        raise unittest.SkipTest("Chrome is not available in this environment")

    page_path = SITE_ROOT / MOBILE_PAGE

    with tempfile.TemporaryDirectory() as temp_dir:
        probe_path = Path(temp_dir) / "mobile-nav-drawer-probe.html"
        probe_path.write_text(_build_probe_document(page_path), encoding="utf-8")

        command = [
            CHROME_BINARY,
            "--headless=new",
            "--disable-gpu",
            "--disable-background-networking",
            "--allow-file-access-from-files",
            "--no-sandbox",
            "--run-all-compositor-stages-before-draw",
            "--virtual-time-budget=3000",
            "--window-size=375,812",
            "--dump-dom",
            probe_path.as_uri(),
        ]
        completed = subprocess.run(command, check=True, capture_output=True, text=True)

        match = re.search(
            r'<pre id="probe-output">(.*?)</pre>',
            completed.stdout,
            flags=re.IGNORECASE | re.DOTALL,
        )
        if not match:
            raise AssertionError(f"Probe output not found in dumped DOM.\nSTDERR:\n{completed.stderr}")
        return json.loads(html.unescape(match.group(1)))


class MobileNavDrawerBlurTest(unittest.TestCase):
    """Regression coverage for the mobile nav drawer layering."""

    def test_mobile_drawer_stays_crisp_above_overlay(self):
        """The open drawer should sit above the overlay and not blur itself."""
        result = _render_mobile_drawer_state()
        sidebar_filter = result["sidebar"].get("backdropFilter") or result["sidebar"].get("webkitBackdropFilter")

        self.assertTrue(result["drawerChecked"], result)
        self.assertEqual(result["insideDrawerTop"], ".md-sidebar--primary", result)
        self.assertIn(sidebar_filter, (None, "", "none"), result)
        self.assertEqual(result["container"]["zIndex"], "auto", result)
        self.assertEqual(result["main"]["zIndex"], "auto", result)

    def test_mobile_overlay_keeps_backdrop_blur_outside_drawer(self):
        """The overlay should still blur and own hit-testing outside the drawer."""
        result = _render_mobile_drawer_state()
        overlay_filter = result["overlay"]["backdropFilter"] or result["overlay"]["webkitBackdropFilter"]

        self.assertEqual(result["outsideDrawerTop"], ".md-overlay", result)
        self.assertTrue(overlay_filter and "blur(" in overlay_filter, result)
        self.assertEqual(result["overlay"]["opacity"], "1", result)
