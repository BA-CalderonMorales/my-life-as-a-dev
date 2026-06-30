"""
Mobile table-of-contents button regression tests.

The Zensical mobile TOC is CSS-driven: a floating label toggles the hidden
#__toc checkbox, and the secondary sidebar panel opens from that checked state.
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

    source = re.sub(r"<script\b[^>]*>.*?</script>", "", source, flags=re.IGNORECASE | re.DOTALL)
    source = source.replace("<head>", f'<head>\n<base href="{base_href}">\n', 1)
    source = source.replace('type="checkbox" id="__toc">', 'type="checkbox" id="__toc" checked>', 1)

    probe_script = """
<script>
document.addEventListener("DOMContentLoaded", function () {
  requestAnimationFrame(function () {
    setTimeout(function () {
      var tocInput = document.getElementById("__toc");
      var sidebar = document.querySelector(".md-sidebar--secondary");
      var panel = document.querySelector(".md-sidebar--secondary .md-sidebar__inner");
      var button = document.querySelector(".md-sidebar--secondary .md-sidebar-button");

      function snapshot(node) {
        if (!node) return null;
        var style = getComputedStyle(node);
        var rect = node.getBoundingClientRect();
        return {
          display: style.display,
          opacity: style.opacity,
          pointerEvents: style.pointerEvents,
          position: style.position,
          zIndex: style.zIndex,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        };
      }

      var result = {
        tocChecked: !!tocInput && tocInput.checked,
        sidebar: snapshot(sidebar),
        panel: snapshot(panel),
        button: snapshot(button)
      };

      document.body.innerHTML = '<pre id="probe-output"></pre>';
      document.getElementById("probe-output").textContent = JSON.stringify(result);
    }, 200);
  });
});
</script>
"""

    return source.replace("</body>", f"{probe_script}\n</body>", 1)


def _render_mobile_toc_state() -> dict[str, object]:
    if not CHROME_BINARY:
        raise unittest.SkipTest("Chrome is not available in this environment")

    page_path = SITE_ROOT / MOBILE_PAGE

    with tempfile.TemporaryDirectory() as temp_dir:
        probe_path = Path(temp_dir) / "mobile-toc-probe.html"
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


class MobileTocButtonTest(unittest.TestCase):
    """Regression coverage for the mobile and tablet TOC button."""

    def test_mobile_toc_css_uses_fixed_floating_sidebar(self):
        """The custom mobile TOC override should preserve the theme's fixed panel model."""
        css = (PROJECT_ROOT / "docs/assets/css/background.css").read_text(encoding="utf-8")

        self.assertIn(".md-sidebar--secondary:not([hidden])", css)
        self.assertIn("position: fixed;", css)
        self.assertIn(".md-sidebar--secondary [type=\"checkbox\"]:checked ~ .md-sidebar__inner", css)
        self.assertNotIn("position: static;\n        width: 0;\n        height: 0;", css)

    def test_checked_mobile_toc_reveals_visible_panel(self):
        """The checked TOC state should reveal a visible, clickable panel."""
        result = _render_mobile_toc_state()
        panel = result["panel"]

        self.assertTrue(result["tocChecked"], result)
        self.assertEqual(result["sidebar"]["position"], "fixed", result)
        self.assertEqual(panel["opacity"], "1", result)
        self.assertEqual(panel["pointerEvents"], "auto", result)
        self.assertGreater(panel["width"], 200, result)
        self.assertGreater(panel["height"], 100, result)
        self.assertGreaterEqual(panel["x"], 0, result)
        self.assertLessEqual(panel["x"] + panel["width"], 375, result)
