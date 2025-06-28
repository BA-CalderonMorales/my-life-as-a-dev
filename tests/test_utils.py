import unittest
from unittest import mock
from pathlib import Path
import tempfile

import scripts.python.utils as utils

class TestSlug(unittest.TestCase):
    def test_slug_sanitizes(self):
        self.assertEqual(utils.slug("My Repo"), "my_repo")
        self.assertEqual(utils.slug("Already_Slug"), "already_slug")
        self.assertEqual(utils.slug("Something--Weird!!!"), "something_weird")

class TestCachedGet(unittest.TestCase):
    def test_force_refresh_bypasses_cache(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            # patch cache dir and session
            url = "https://example.com/data"
            cache_key = utils.hashlib.sha256(url.encode()).hexdigest()
            cache_file = Path(tmpdir) / cache_key
            cache_file.write_text("cached")
            with mock.patch.object(utils, "CACHE_DIR", Path(tmpdir)):
                with mock.patch.object(utils, "_session") as session:
                    session.get.return_value.status_code = 200
                    session.get.return_value.text = "fresh"
                    result = utils.cached_get(url, force=True)
                    self.assertEqual(result, "fresh")
                    session.get.assert_called_once()
    def test_uses_cache_when_available(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            url = "https://example.com/data"
            cache_key = utils.hashlib.sha256(url.encode()).hexdigest()
            cache_file = Path(tmpdir) / cache_key
            cache_file.write_text("cached")
            with mock.patch.object(utils, "CACHE_DIR", Path(tmpdir)):
                with mock.patch.object(utils, "_session") as session:
                    result = utils.cached_get(url)
                    self.assertEqual(result, "cached")
                    session.get.assert_not_called()

class TestCachedGetJson(unittest.TestCase):
    def test_returns_json_from_cache(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            url = "https://example.com/data.json"
            cache_key = utils.hashlib.sha256(url.encode()).hexdigest()
            cache_file = Path(tmpdir) / cache_key
            cache_file.write_text('{"foo": 1}')
            with mock.patch.object(utils, "CACHE_DIR", Path(tmpdir)):
                with mock.patch.object(utils, "_session") as session:
                    result = utils.cached_get_json(url)
                    self.assertEqual(result, {"foo": 1})
                    session.get.assert_not_called()

    def test_force_refresh_fetches_json(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            url = "https://example.com/data.json"
            cache_key = utils.hashlib.sha256(url.encode()).hexdigest()
            cache_file = Path(tmpdir) / cache_key
            cache_file.write_text("{\"foo\": 1}")
            with mock.patch.object(utils, "CACHE_DIR", Path(tmpdir)):
                with mock.patch.object(utils, "_session") as session:
                    session.get.return_value.status_code = 200
                    session.get.return_value.text = '{"bar": 2}'
                    result = utils.cached_get_json(url, force=True)
                    self.assertEqual(result, {"bar": 2})
                    session.get.assert_called_once()

    def test_invalid_json_returns_none(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            url = "https://example.com/bad.json"
            cache_key = utils.hashlib.sha256(url.encode()).hexdigest()
            cache_file = Path(tmpdir) / cache_key
            cache_file.write_text("not json")
            with mock.patch.object(utils, "CACHE_DIR", Path(tmpdir)):
                with mock.patch.object(utils, "_session") as session:
                    result = utils.cached_get_json(url)
                    self.assertIsNone(result)
                    session.get.assert_not_called()

if __name__ == "__main__":
    unittest.main()
