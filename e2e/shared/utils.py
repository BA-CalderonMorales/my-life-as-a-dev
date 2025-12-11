"""
Shared utilities for e2e tests.
"""

from pathlib import Path


def assert_path_exists(label: str, target_path: Path) -> Path:
    """Assert that a path exists and return its resolved form."""
    if not target_path.exists():
        raise AssertionError(f"{label} is missing at {target_path}")
    return target_path.resolve()


def assert_file_exists(label: str, target_path: Path) -> Path:
    """Assert that a file exists."""
    resolved = assert_path_exists(label, target_path)
    if not resolved.is_file():
        raise AssertionError(f"{label} is not a file at {target_path}")
    return resolved


def assert_directory_exists(label: str, target_path: Path) -> Path:
    """Assert that a directory exists."""
    resolved = assert_path_exists(label, target_path)
    if not resolved.is_dir():
        raise AssertionError(f"{label} is not a directory at {target_path}")
    return resolved


def has_emoji(text: str) -> bool:
    """Check if text contains emoji characters."""
    for char in text:
        if ord(char) > 0x1F300:
            return True
    return False


def has_raw_markdown(text: str) -> list[str]:
    """Check for raw markdown that should have been rendered."""
    issues = []
    if "{ .md-button" in text:
        issues.append("Raw button attribute syntax visible")
    if "**" in text:
        # Check for actual raw bold markers (not rendered)
        if text.count("**") >= 2:
            issues.append("Possible raw bold markdown visible")
    if text.strip().startswith("# "):
        issues.append("Raw heading markdown visible")
    return issues
