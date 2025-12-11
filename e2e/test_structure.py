"""
E2e test structure validation.
Ensures all page sources exist and the e2e folder structure is valid.
"""

import pytest
from pathlib import Path


class TestE2eStructure:
    """Validate e2e folder structure and page source mappings."""

    def test_shared_directory_exists(self):
        """Shared utilities directory should exist."""
        shared_path = Path(__file__).parent / "shared"
        assert shared_path.exists(), f"Shared directory missing: {shared_path}"
        assert shared_path.is_dir()

    def test_pages_directory_exists(self):
        """Pages test directory should exist."""
        pages_path = Path(__file__).parent / "pages"
        assert pages_path.exists(), f"Pages directory missing: {pages_path}"
        assert pages_path.is_dir()

    def test_config_directory_exists(self):
        """Config directory should exist."""
        config_path = Path(__file__).parent / "config"
        assert config_path.exists(), f"Config directory missing: {config_path}"
        assert config_path.is_dir()

    def test_readme_exists(self):
        """E2e README should exist."""
        readme_path = Path(__file__).parent / "README.md"
        assert readme_path.exists(), f"README missing: {readme_path}"

    def test_conftest_exists(self):
        """Conftest should exist for pytest fixtures."""
        conftest_path = Path(__file__).parent / "conftest.py"
        assert conftest_path.exists(), f"conftest.py missing: {conftest_path}"

    def test_all_page_sources_exist(self, page_sources, docs_root):
        """All page source files should exist."""
        assert docs_root.exists(), f"Docs root missing: {docs_root}"
        for key, config in page_sources.items():
            source = config["source"]
            assert source.exists(), f"{config['name']} source missing: {source}"

    def test_page_source_files_are_markdown(self, page_sources):
        """All page sources should be markdown files."""
        for key, config in page_sources.items():
            source = config["source"]
            assert source.suffix == ".md", f"{config['name']} should be markdown: {source}"
