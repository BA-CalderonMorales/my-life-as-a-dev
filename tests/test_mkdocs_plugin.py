import yaml
from pathlib import Path
import unittest

MKDOCS_FILE = Path(__file__).resolve().parent.parent / "mkdocs.yml"

class TestPlugins(unittest.TestCase):
    def test_glightbox_enabled(self):
        # Use the default loader so custom tags don't break parsing
        with MKDOCS_FILE.open() as f:
            config = yaml.load(f, Loader=yaml.Loader)
        plugins = config.get("plugins", [])
        # plugins may be list of strings or dicts
        plugin_names = []
        for p in plugins:
            if isinstance(p, str):
                plugin_names.append(p)
            elif isinstance(p, dict):
                plugin_names.extend(p.keys())
        self.assertIn("glightbox", plugin_names)

if __name__ == "__main__":
    unittest.main()
