"""Root organ contracts: taper, collars, and the mask reveal pairing.

The roots must read as organs on a botanical plate, never wires:
- every root tapers from flare to hair-thin tip (ratio <= 0.12),
- every interior fork carries a collar swelling on its parent,
- every filled tapered shape is revealed by a mask centerline carrying
  the same --root-delay/--root-span window.
"""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "docs" / "index.md"
TIERS = ("primary", "lateral", "fine")
TAPER_RATIO_LIMIT = 0.12
NUMBERS = re.compile(r"-?\d+(?:\.\d+)?")


def _load_gen_tree():
    """Load the tree generator from its hyphenated directory."""
    import importlib.util

    path = ROOT / "scripts" / "python" / "tree-gen" / "gen_tree.py"
    spec = importlib.util.spec_from_file_location("mlad_gen_tree_organs", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _distance(a, b):
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5


def test_every_root_spec_tapers_from_flare_to_hair_tip():
    """Width alone must carry the hierarchy: tips are <= 0.12 of flares."""
    gen_tree = _load_gen_tree()

    assert gen_tree.ROOT_SPECS, "root specs vanished"
    for spec in gen_tree.ROOT_SPECS:
        ratio = spec.tip / spec.flare
        assert ratio <= TAPER_RATIO_LIMIT, (
            f"{spec.name}: tip/flare ratio {ratio:.3f} exceeds "
            f"{TAPER_RATIO_LIMIT}; width no longer reads as an organ"
        )


def _body_path(gen_tree, record):
    """Emit one body outline exactly as build_roots does for this record."""
    spec = record.spec
    return gen_tree.taper_outline(
        record.pts, spec.flare, spec.tip, seed=spec.seed,
        taper_pow=0.8, wob=0.7, collars=record.collars,
    )


def test_outline_geometry_actually_narrows_toward_the_tip():
    """The emitted body outline must narrow measurably toward its tip.

    The outline is left edge + sharp tip + reversed right edge, so the
    first and last vertices sit across the flare from each other and the
    vertices flanking the sharp tip sit across the near-tip width.
    """
    gen_tree = _load_gen_tree()
    records = gen_tree.build_root_records()

    for name, rec in records.items():
        coords = [float(v) for v in NUMBERS.findall(_body_path(gen_tree, rec))]
        points = list(zip(coords[0::2], coords[1::2]))
        flank = (len(points) - 2) // 2
        flare_width = _distance(points[0], points[-1])
        tip_width = _distance(points[flank], points[flank + 1])
        assert flare_width > 0, f"{name}: degenerate outline"
        # Wires have tip/flare ~ 1; organs stay well under half even
        # after edge wobble is accounted for.
        assert tip_width / flare_width < 0.35, (
            f"{name}: outline barely narrows "
            f"(tip {tip_width:.1f} vs flare {flare_width:.1f}); reads as a wire"
        )


def test_collars_match_interior_forks():
    """Every fork strictly inside the parent gets exactly one collar."""
    gen_tree = _load_gen_tree()
    records = gen_tree.build_root_records()

    expected = {}
    for rec in records.values():
        if rec.spec.parent is not None:
            lo, hi = gen_tree.COLLAR_WINDOW
            if lo <= rec.fork_t <= hi:
                expected[rec.spec.parent] = expected.get(rec.spec.parent, 0) + 1

    for parent_name, count in expected.items():
        actual = len(records[parent_name].collars)
        assert actual == count, (
            f"{parent_name}: {actual} collars for {count} forks; "
            "junctions must swell where children leave"
        )
    total_collars = sum(len(rec.collars) for rec in records.values())
    assert total_collars == sum(expected.values())


def test_children_leave_their_parent_tangentially():
    """No perpendicular T junctions: each child's first segment stays
    within 45 degrees of its parent's flow at the fork."""
    gen_tree = _load_gen_tree()
    records = gen_tree.build_root_records()

    for rec in records.values():
        if rec.spec.parent is None:
            continue
        parent = records[rec.spec.parent]
        px, py = rec.pts[0]
        _, (tx, ty), _ = parent.point_at(rec.fork_t)
        vx, vy = rec.waypoints[1][0] - px, rec.waypoints[1][1] - py
        dot = abs(vx * tx + vy * ty)
        cross = abs(vx * ty - vy * tx)
        assert cross <= dot * 1.05 + 1e-6, (
            f"{rec.spec.name} leaves its parent near-perpendicular; "
            "forks must depart tangentially"
        )


def test_every_pioneer_carries_an_elbow_kink():
    """Smooth sines everywhere are a failure mode: primaries bend."""
    gen_tree = _load_gen_tree()

    pioneers = [spec for spec in gen_tree.ROOT_SPECS if spec.tier == "primary"]
    assert pioneers
    for spec in pioneers:
        assert spec.kinks, f"{spec.name}: no elbow kink; spine reads extruded"


def test_mask_pairs_every_tapered_shape_with_its_centerline():
    """Each tier's mask carries exactly one white centerline stroke per
    tapered body, with the identical delay/span window per root."""
    gen_tree = _load_gen_tree()
    markup = gen_tree.build_roots()
    records = gen_tree.build_root_records()

    for tier in TIERS:
        tier_specs = [s for s in gen_tree.ROOT_SPECS if s.tier == tier]
        stroke_count = len(re.findall(
            rf'class="life-tree__root life-tree__root--{tier}"', markup
        ))
        body_count = len(re.findall(
            rf'class="life-tree__root-body life-tree__root-body--{tier}"',
            markup,
        ))
        assert stroke_count == len(tier_specs) == body_count, (
            f"{tier}: shape/stroke/spec counts disagree "
            f"({body_count}/{stroke_count}/{len(tier_specs)})"
        )
        for spec in tier_specs:
            rec = records[spec.name]
            needle = f'--root-delay:{spec.delay};--root-span:{rec.span:.2f}'
            assert needle in markup, (
                f"{spec.name}: mask stroke lost its delay/span window"
            )

    # Tier groups reference their tier mask; masks live in defs.
    for tier in TIERS:
        assert f'mask="url(#life-roots-mask-{tier})"' in markup
        assert f'<mask id="life-roots-mask-{tier}"' in markup


def test_fallback_chain_survives_the_mask_swap():
    """No-JS and reduced motion resolve every window to fully drawn; the
    page keeps the same --life-roots contract that hid roots pre-JS."""
    css = (ROOT / "docs" / "assets" / "css" / "life-tree.css").read_text(
        encoding="utf-8"
    )
    landing = (ROOT / "docs" / "assets" / "css" / "landing.css").read_text(
        encoding="utf-8"
    )

    # Reveal math still keyed off --life-root-growth windows...
    assert "--life-root-growth" in css
    assert ".life-tree__root" in css
    # ...the flat master defaults to visible for no-JS and reduced motion,
    # and html.js hides everything before the first frame.
    assert "--life-roots: 1;" in landing
    assert "--life-roots: 0;" in landing
    assert "--life-roots: 1 !important" in landing
