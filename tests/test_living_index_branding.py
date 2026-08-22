"""Source contracts for the living-index identity."""

import json
import math
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from scripts.python import generate_life_tree, patch_life_tree


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "docs" / "index.md"
LOGO = ROOT / "docs" / "overrides" / "partials" / "logo.html"
MARK = ROOT / "docs" / "assets" / "images" / "favicon" / "brand-mark.svg"
FAVICON = ROOT / "docs" / "assets" / "images" / "favicon" / "favicon.ico"
MANIFEST = ROOT / "docs" / "manifest.webmanifest"
ASSET_CONFIG = ROOT / "config" / "zensical" / "02-assets.toml"
FACETS = ("work", "make", "serve", "learn", "life")
BRAND_PATHS = (
    "M32 52V20",
    "M32 37C24 34 19 29 14 21",
    "M32 29C40 26 46 20 50 12",
    "M32 43C40 42 47 38 53 32",
)


def test_header_and_favicon_share_the_branch_geometry():
    """The navigation mark and browser mark should use one branch system."""
    logo = LOGO.read_text(encoding="utf-8")
    mark = MARK.read_text(encoding="utf-8")
    assert re.findall(r'<path d="([^"]+)"', logo) == list(BRAND_PATHS)

    # The browser mark re-traces the same skeleton in the site's
    # hand-drawn style: one stroke per brand path, plus a fruit dot
    # pinned at every branch tip within a pencil-width of tolerance.
    stroke_group = re.search(r"<g[^>]*>(.*?)</g>", mark, re.S)
    assert stroke_group, "browser mark lost its stroke group"
    mark_strokes = re.findall(r'<path d="([^"]+)"', stroke_group.group(1))
    assert len(mark_strokes) == len(BRAND_PATHS)

    tips = [(14, 21), (50, 12), (53, 31)]
    dots = [
        (float(match.group(1)), float(match.group(2)))
        for match in re.finditer(
            r'<circle cx="([\d.]+)" cy="([\d.]+)"', mark
        )
    ]
    assert len(dots) == len(tips)
    for tip_x, tip_y in tips:
        assert any(math.hypot(dx - tip_x, dy - tip_y) <= 1 for dx, dy in dots)


def test_favicon_is_a_real_icon_container():
    """The configured favicon should be a binary ICO, not encoded text."""
    assert FAVICON.read_bytes().startswith(b"\x00\x00\x01\x00")


def test_manifest_uses_the_public_identity():
    """Install metadata should match the portfolio name and palette."""
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    assert manifest["name"] == "Brandon A. Calderon Morales"
    assert manifest["short_name"] == "Brandon"
    assert manifest["background_color"] == "#f3f0e8"


def test_living_index_script_is_shipped_by_zensical():
    """The interaction module should be registered in modular config."""
    config = ASSET_CONFIG.read_text(encoding="utf-8")

    assert '"assets/js/living-index.js"' in config
    assert '"assets/js/life-tree.js"' in config
    assert '"assets/css/life-tree.css"' in config


def test_life_tree_generator_is_deterministic_and_finite():
    """The fixed seed should always produce the same valid SVG fragment."""
    first = generate_life_tree.build()
    second = generate_life_tree.build()

    assert first == second
    assert generate_life_tree.validate(first)
    assert "nan" not in first.lower()
    assert "inf" not in first.lower()

    for token in re.findall(r"-?\d+(?:\.\d+)?", first):
        assert math.isfinite(float(token))


def test_life_tree_geometry_and_semantic_layers_are_separate():
    """One grown silhouette should sit behind five semantic hit paths."""
    markup = generate_life_tree.build()
    wood = re.search(
        r'<path class="life-tree__wood-shape" d="([^"]+)"', markup
    )

    assert wood is not None
    assert len(re.findall(r"(?:^|\s)M\s", wood.group(1))) == 1
    assert re.findall(r'data-tree-branch="([^"]+)"', markup) == list(FACETS)
    assert re.findall(r'data-tree-node="([^"]+)"', markup) == []
    assert markup.count('class="life-tree__wood-shape"') == 1
    assert markup.count('class="life-tree__branch-hit"') == 5
    assert markup.count('class="life-tree__roots"') == 1
    assert markup.count('class="life-tree__canopy-shape"') == 1
    assert markup.index('class="life-tree__roots"') < markup.index(
        'class="life-tree__breeze"'
    )
    assert markup.index('class="life-tree__wood"') < markup.index(
        'class="life-tree__breeze"'
    )
    assert markup.index('class="life-tree__limbs"') > markup.index(
        'class="life-tree__breeze"'
    )


def test_life_tree_root_network_has_explicit_botanical_topology():
    """Every child root should emerge from an authored point on its parent."""
    roots = generate_life_tree.ROOT_PATHS
    root_by_id = {}
    coordinates_by_id = {}
    tier_counts = {
        tier: sum(root.tier == tier for root in roots)
        for tier in ("primary", "secondary", "fine")
    }

    assert tier_counts == {"primary": 5, "secondary": 12, "fine": 18}
    for root in roots:
        coordinates = [
            float(value)
            for value in re.findall(r"-?\d+(?:\.\d+)?", root.path)
        ]
        points = list(zip(coordinates[::2], coordinates[1::2]))
        anchor = f"{root.anchor[0]:.0f} {root.anchor[1]:.0f}"

        assert root.root_id not in root_by_id
        assert root.path.startswith(f"M {anchor}")
        if root.tier == "primary":
            assert root.parent == "trunk"
        else:
            assert root.parent in root_by_id
            parent = root_by_id[root.parent]
            expected_parent_tier = (
                "primary" if root.tier == "secondary" else "secondary"
            )
            assert parent.tier == expected_parent_tier
            assert root.anchor in coordinates_by_id[root.parent]

        root_by_id[root.root_id] = root
        coordinates_by_id[root.root_id] = set(points)


def test_life_tree_root_footprint_is_deep_asymmetric_and_viewbox_safe():
    """The roots should fill the new canvas without forming a shared floor."""
    extents = []
    primary_terminal_depths = []

    for root in generate_life_tree.ROOT_PATHS:
        coordinates = [
            float(value)
            for value in re.findall(r"-?\d+(?:\.\d+)?", root.path)
        ]
        points = list(zip(coordinates[::2], coordinates[1::2]))
        radius = root.width / 2
        extents.extend(
            (x - radius, y - radius, x + radius, y + radius)
            for x, y in points
        )
        if root.tier == "primary":
            primary_terminal_depths.append(points[-1][1])

    min_x = min(extent[0] for extent in extents)
    min_y = min(extent[1] for extent in extents)
    max_x = max(extent[2] for extent in extents)
    max_y = max(extent[3] for extent in extents)

    assert min_x < 14.0
    assert max_x > 706.0
    assert max_x - min_x > 692.0
    assert min_y >= 696.0
    assert max_y >= 1172.0
    assert max_y - min_y > 470.0
    assert 1200.0 - max_y >= 27.0
    assert len(set(primary_terminal_depths)) == 5
    assert max(primary_terminal_depths) - min(primary_terminal_depths) >= 180.0


def test_life_tree_root_reveal_is_tiered_and_finishes_at_one():
    """Root growth should progress from scaffold to fine terminal detail."""
    roots = generate_life_tree.ROOT_PATHS
    root_by_id = {root.root_id: root for root in roots}
    reveal_ends = [root.delay + root.span for root in roots]
    tier_delays = {
        tier: [root.delay for root in roots if root.tier == tier]
        for tier in ("primary", "secondary", "fine")
    }

    assert max(tier_delays["primary"]) < min(tier_delays["secondary"])
    assert max(tier_delays["secondary"]) < min(tier_delays["fine"])
    assert sum(math.isclose(end, 1.0) for end in reveal_ends) == 1
    assert math.isclose(max(reveal_ends), 1.0)
    assert all(end <= 1.0 for end in reveal_ends)
    for root in roots:
        if root.parent != "trunk":
            assert root.delay > root_by_id[root.parent].delay


def test_life_tree_breeze_contains_only_the_visible_crown():
    """Wood, roots, and semantic controls should remain planted and aligned."""
    markup = generate_life_tree.build()
    fragment = ET.fromstring(f"<svg>{markup}</svg>")
    direct_classes = [element.get("class") for element in fragment]
    breeze = next(
        element
        for element in fragment
        if element.get("class") == "life-tree__breeze"
    )

    assert [element.get("class") for element in breeze] == [
        "life-tree__canopy-mass",
        "life-tree__limbs",
        "life-tree__foliage",
    ]
    assert direct_classes.index("life-tree__roots") < direct_classes.index(
        "life-tree__wood"
    )
    assert direct_classes.index("life-tree__wood") < direct_classes.index(
        "life-tree__bark"
    )
    assert direct_classes.index("life-tree__bark") < direct_classes.index(
        "life-tree__breeze"
    )
    assert direct_classes.index("life-tree__breeze") < direct_classes.index(
        "life-tree__hit-branches"
    )
    assert direct_classes.index("life-tree__hit-branches") < direct_classes.index(
        "life-tree__nodes"
    )
    assert direct_classes.index("life-tree__nodes") < direct_classes.index(
        "life-tree__pixels"
    )
    assert breeze.find(".//*[@class='life-tree__hit-branches']") is None
    assert breeze.find(".//*[@class='life-tree__nodes']") is None
    assert breeze.find(".//*[@class='life-tree__pixels']") is None
    assert breeze.find(".//*[@class='life-tree__roots']") is None
    assert breeze.find(".//*[@class='life-tree__wood']") is None
    assert breeze.find(".//*[@class='life-tree__bark']") is None
    assert markup.count('class="life-tree__cluster"') == 35
    assert len(re.findall(r'<path class="life-tree__leaf(?: |")', markup)) == 163


def test_life_tree_wrapper_uses_the_expanded_root_viewbox():
    """The wrapper should reserve the authored root depth without clipping."""
    wrapped = patch_life_tree.svg_markup(generate_life_tree.build())

    assert 'viewBox="0 0 720 1200"' in wrapped
    assert 'viewBox="0 0 720 1080"' not in wrapped
    assert 'viewBox="0 0 720 900"' not in wrapped


def test_generated_homepage_keeps_every_tree_and_dossier_target():
    """Generated markup should preserve the public interaction contract."""
    index = INDEX.read_text(encoding="utf-8")

    assert re.findall(r'data-tree-branch="([^"]+)"', index) == list(FACETS)
    assert re.findall(r'data-tree-node="([^"]+)"', index) == []
    assert re.findall(r'data-life-target="([^"]+)"', index) == list(FACETS)
    assert re.findall(r'data-life-panel="([^"]+)"', index) == list(FACETS)
    for facet in FACETS:
        assert f'id="{facet}"' in index


def _load_gen_tree():
    """Load the tree generator from its hyphenated directory."""
    import importlib.util

    path = ROOT / "scripts" / "python" / "tree-gen" / "gen_tree.py"
    spec = importlib.util.spec_from_file_location("mlad_gen_tree", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_generated_homepage_keeps_root_topology_and_expanded_bounds():
    """The checked-in page should match the generated root contract."""
    index = INDEX.read_text(encoding="utf-8")
    gen_tree = _load_gen_tree()

    assert 'viewBox="0 0 720 1200"' in index

    expected_tiers = {"primary": 0, "lateral": 0, "fine": 0}
    for _, _, tier, _delay in gen_tree.ROOTS:
        expected_tiers[tier] += 1
    for tier, count in expected_tiers.items():
        assert index.count(f'life-tree__root--{tier}"') == count

    for name in ("roots", "tree"):
        assert index.count(f"<!-- gen_tree:{name} -->") == 1
        assert index.count(f"<!-- /gen_tree:{name} -->") == 1


def test_life_tree_patcher_is_idempotent():
    """Regenerating twice must not add indentation or change the page again."""
    source = INDEX.read_text(encoding="utf-8")
    generated = generate_life_tree.build()
    once = patch_life_tree.patch_text(source, generated)
    twice = patch_life_tree.patch_text(once, generated)

    assert twice == once
