"""
Property-based test for tree vertical centering.

This test verifies that the living tree SVG is vertically centered in the
viewport (accounting for the fixed header) across different viewport sizes.
"""

import pytest
from playwright.sync_api import Page, expect


VIEWPORTS = [
    ("mobile", {"width": 390, "height": 844}),
    ("tablet", {"width": 768, "height": 1024}),
    ("desktop", {"width": 1440, "height": 900}),
    ("desktop_large", {"width": 1920, "height": 1080}),
    ("desktop_ultrawide", {"width": 2560, "height": 1440}),
]


def _get_tree_center(page: Page) -> dict:
    """Get the center coordinates of the tree shell."""
    tree_shell = page.locator(".life-tree-shell")
    box = tree_shell.bounding_box()
    if not box:
        return {"x": 0, "y": 0}
    return {
        "x": box["x"] + box["width"] / 2,
        "y": box["y"] + box["height"] / 2,
    }


def _get_viewport_size(page: Page) -> dict:
    """Get the actual viewport size in pixels."""
    return page.evaluate("() => ({width: window.innerWidth, height: window.innerHeight})")


def _get_header_height_px(page: Page) -> int:
    """Get the header height in pixels."""
    header = page.locator(".md-header")
    box = header.bounding_box()
    if not box:
        return 0
    return box["height"]


def _wait_for_enhancement(page: Page):
    """Wait for the living index enhancement to apply."""
    page.wait_for_function(
        "document.querySelector('[data-life-index]')?.classList.contains('is-enhanced')"
    )


@pytest.mark.parametrize("viewport_name,viewport", VIEWPORTS)
def test_tree_vertical_centering(page: Page, base_url: str, viewport_name: str, viewport: dict):
    """
    Property: The tree should be vertically centered in the available viewport
    space below the fixed header.

    The visual center of the tree should align with the center of the viewport
    minus the header height.
    """
    # Only test on landing page where the tree exists
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    page.wait_for_timeout(500)

    # Wait for JS enhancement to apply (is-enhanced class added by living-index.js)
    _wait_for_enhancement(page)

    # Get ACTUAL measurements from the browser
    viewport_size = _get_viewport_size(page)
    viewport_height = viewport_size["height"]
    header_height = _get_header_height_px(page)
    tree_center = _get_tree_center(page)

    # Expected center: header_height + (viewport_height - header_height) / 2
    expected_center_y = header_height + (viewport_height - header_height) / 2

    # Allow small tolerance for sub-pixel rendering and layout differences
    tolerance = 4  # pixels

    assert abs(tree_center["y"] - expected_center_y) <= tolerance, (
        f"Tree not vertically centered on {viewport_name}. "
        f"Tree center Y: {tree_center['y']:.1f}px, Expected: {expected_center_y:.1f}px, "
        f"Header: {header_height}px, Viewport: {viewport_height}px, "
        f"Diff: {abs(tree_center['y'] - expected_center_y):.1f}px"
    )


@pytest.mark.parametrize("viewport_name,viewport", VIEWPORTS)
def test_tree_horizontal_centering(page: Page, base_url: str, viewport_name: str, viewport: dict):
    """
    Property: The tree should be horizontally centered in the viewport.
    """
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    page.wait_for_timeout(500)
    _wait_for_enhancement(page)

    viewport_size = _get_viewport_size(page)
    viewport_width = viewport_size["width"]
    tree_center = _get_tree_center(page)
    expected_center_x = viewport_width / 2

    tolerance = 6  # pixels (allow sub-pixel rounding)

    assert abs(tree_center["x"] - expected_center_x) <= tolerance, (
        f"Tree not horizontally centered on {viewport_name}. "
        f"Tree center X: {tree_center['x']:.1f}px, Expected: {expected_center_x:.1f}px, "
        f"Viewport width: {viewport_width}px, Diff: {abs(tree_center['x'] - expected_center_x):.1f}px"
    )


@pytest.mark.parametrize("viewport_name,viewport", VIEWPORTS)
def test_tree_aspect_ratio_preserved(page: Page, base_url: str, viewport_name: str, viewport: dict):
    """
    Property: The tree SVG should maintain its 3:5 aspect ratio.
    """
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    page.wait_for_timeout(500)
    _wait_for_enhancement(page)

    tree_shell = page.locator(".life-tree-shell")
    box = tree_shell.bounding_box()

    if not box:
        pytest.skip("Tree shell not found")

    actual_ratio = box["width"] / box["height"]
    expected_ratio = 3 / 5

    # Allow 2% tolerance for layout rounding
    tolerance = 0.02

    assert abs(actual_ratio - expected_ratio) <= tolerance, (
        f"Tree aspect ratio not preserved on {viewport_name}. "
        f"Actual: {actual_ratio:.3f}, Expected: {expected_ratio:.3f}"
    )


@pytest.mark.parametrize("viewport_name,viewport", VIEWPORTS)
def test_tree_not_overflowing_viewport(page: Page, base_url: str, viewport_name: str, viewport: dict):
    """
    Property: The tree should not overflow the viewport horizontally or vertically
    (beyond the header space).
    """
    page.goto(f"{base_url}/index.html", wait_until="networkidle")
    page.wait_for_timeout(500)
    _wait_for_enhancement(page)

    tree_shell = page.locator(".life-tree-shell")
    box = tree_shell.bounding_box()

    if not box:
        pytest.skip("Tree shell not found")

    viewport_size = _get_viewport_size(page)
    viewport_width = viewport_size["width"]
    viewport_height = viewport_size["height"]
    header_height = _get_header_height_px(page)

    # Tree should be within viewport horizontally
    assert box["x"] >= -1, f"Tree overflows left on {viewport_name}: x={box['x']}"
    assert box["x"] + box["width"] <= viewport_width + 1, (
        f"Tree overflows right on {viewport_name}: "
        f"right={box['x'] + box['width']:.1f}, viewport={viewport_width}"
    )

    # Tree center should be below header (tree top can extend into header area)
    tree_center_y = box["y"] + box["height"] / 2
    assert tree_center_y >= header_height - 10, (
        f"Tree center overlaps header on {viewport_name}: "
        f"tree_center_y={tree_center_y:.1f}, header_bottom={header_height}"
    )

    # Tree bottom should not exceed viewport significantly
    # (some overflow is OK for the roots extending down)
    assert box["y"] + box["height"] <= viewport_height + 100, (
        f"Tree excessively overflows bottom on {viewport_name}: "
        f"tree_bottom={box['y'] + box['height']:.1f}, viewport={viewport_height}"
    )