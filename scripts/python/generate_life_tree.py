#!/usr/bin/env python3
"""Generate the deterministic living-index tree SVG fragment.

Visible wood and interactive geometry are deliberately separate. One sampled
exterior contour paints the trunk and planted flare; crown limbs render as
separate breeze-bound ribbons. Five transparent paths reuse the exact
primary-limb centerlines for pointer and keyboard interaction.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from math import atan2, cos, floor, hypot, isfinite, sin, tau
from pathlib import Path
from random import Random
import re


SEED = 11
ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "scratch" / "life-tree.svg"

HUB = (360.0, 486.0)
TRUNK_BASE = (372.0, 704.0)
TRUNK_TOP = (356.0, 408.0)

FACETS = {
    "work": {"node": (92.0, 286.0), "start": (354.0, 526.0), "curve": -36.0},
    "make": {"node": (218.0, 178.0), "start": (354.0, 478.0), "curve": -18.0},
    "serve": {"node": (350.0, 112.0), "start": (356.0, 430.0), "curve": 12.0},
    "learn": {"node": (500.0, 188.0), "start": (365.0, 468.0), "curve": 20.0},
    "life": {"node": (630.0, 274.0), "start": (370.0, 518.0), "curve": 38.0},
}

AMBIENT = (
    ("far-left", (56.0, 356.0), (350.0, 548.0)),
    ("upper-left", (128.0, 184.0), (352.0, 494.0)),
    ("mid-left", (178.0, 256.0), (351.0, 512.0)),
    ("crown-left", (282.0, 112.0), (356.0, 438.0)),
    ("crown-right", (430.0, 116.0), (363.0, 442.0)),
    ("mid-right", (548.0, 252.0), (368.0, 506.0)),
    ("upper-right", (584.0, 168.0), (368.0, 488.0)),
    ("far-right", (674.0, 346.0), (373.0, 544.0)),
    ("low-left", (166.0, 402.0), (350.0, 566.0)),
    ("low-right", (554.0, 408.0), (373.0, 560.0)),
)

ROOT_TIPS = (
    (184.0, 756.0),
    (294.0, 776.0),
    (454.0, 778.0),
    (564.0, 752.0),
)

Point = tuple[float, float]
Capsule = tuple[float, float, float, float, float, float]


@dataclass(frozen=True)
class LimbGeometry:
    """One sampled centerline and its full-width taper."""

    name: str
    center: tuple[Point, ...]
    widths: tuple[float, ...]


@dataclass(frozen=True)
class RootPath:
    """One authored root with explicit topology and reveal timing."""

    root_id: str
    tier: str
    parent: str
    anchor: Point
    path: str
    width: float
    delay: float
    span: float


@dataclass(frozen=True)
class TreeGeometry:
    """The single geometry model used by paint and interaction output."""

    trunk: LimbGeometry
    primary: tuple[LimbGeometry, ...]
    ambient: tuple[LimbGeometry, ...]
    roots: tuple[LimbGeometry, ...]


ROOT_PATHS = (
    RootPath(
        "root-west",
        "primary",
        "trunk",
        (364.0, 704.0),
        (
            "M 364 704 C 338 724 310 744 280 764 "
            "C 244 792 210 826 170 858 C 132 894 76 944 24 982"
        ),
        9.2,
        0.00,
        0.52,
    ),
    RootPath(
        "root-southwest",
        "primary",
        "trunk",
        (368.0, 706.0),
        (
            "M 368 706 C 350 742 338 776 322 812 "
            "C 306 846 280 878 248 908 C 224 948 206 1008 190 1044 "
            "C 174 1080 160 1110 150 1128"
        ),
        7.4,
        0.02,
        0.56,
    ),
    RootPath(
        "root-sinker",
        "primary",
        "trunk",
        (374.0, 706.0),
        (
            "M 374 706 C 370 754 372 800 364 844 "
            "C 358 884 362 930 350 968 C 342 1018 334 1094 326 1164"
        ),
        8.2,
        0.04,
        0.58,
    ),
    RootPath(
        "root-southeast",
        "primary",
        "trunk",
        (378.0, 706.0),
        (
            "M 378 706 C 400 738 414 774 432 808 "
            "C 450 842 478 870 500 904 C 518 950 536 1002 552 1040 "
            "C 562 1068 570 1094 574 1110"
        ),
        7.0,
        0.06,
        0.55,
    ),
    RootPath(
        "root-east",
        "primary",
        "trunk",
        (382.0, 704.0),
        (
            "M 382 704 C 420 720 452 746 486 770 "
            "C 526 798 558 824 602 846 C 642 876 674 918 696 970"
        ),
        8.6,
        0.08,
        0.50,
    ),
    RootPath(
        "root-west-crown",
        "secondary",
        "root-west",
        (280.0, 764.0),
        (
            "M 280 764 C 246 750 210 754 178 770 "
            "C 146 786 116 808 88 838"
        ),
        4.0,
        0.30,
        0.38,
    ),
    RootPath(
        "root-west-deep",
        "secondary",
        "root-west",
        (170.0, 858.0),
        (
            "M 170 858 C 150 884 132 916 112 940 "
            "C 90 1006 58 1054 26 1090"
        ),
        3.0,
        0.36,
        0.42,
    ),
    RootPath(
        "root-southwest-lateral",
        "secondary",
        "root-southwest",
        (322.0, 812.0),
        (
            "M 322 812 C 292 818 266 832 240 852 "
            "C 210 878 172 902 132 916"
        ),
        3.6,
        0.33,
        0.39,
    ),
    RootPath(
        "root-southwest-deep",
        "secondary",
        "root-southwest",
        (248.0, 908.0),
        (
            "M 248 908 C 220 916 196 934 176 956 "
            "C 154 978 132 1044 116 1092 C 104 1120 98 1136 92 1142"
        ),
        2.8,
        0.42,
        0.40,
    ),
    RootPath(
        "root-center-west",
        "secondary",
        "root-sinker",
        (364.0, 844.0),
        (
            "M 364 844 C 338 858 318 878 300 900 "
            "C 278 930 244 1008 204 1074"
        ),
        3.2,
        0.38,
        0.38,
    ),
    RootPath(
        "root-center-east",
        "secondary",
        "root-sinker",
        (350.0, 968.0),
        (
            "M 350 968 C 372 974 392 990 410 1006 "
            "C 438 1044 474 1098 496 1146"
        ),
        2.6,
        0.47,
        0.35,
    ),
    RootPath(
        "root-southeast-lateral",
        "secondary",
        "root-southeast",
        (432.0, 808.0),
        (
            "M 432 808 C 460 808 486 820 510 838 "
            "C 538 858 574 880 604 902"
        ),
        3.5,
        0.35,
        0.39,
    ),
    RootPath(
        "root-southeast-deep",
        "secondary",
        "root-southeast",
        (500.0, 904.0),
        (
            "M 500 904 C 530 908 554 924 576 946 "
            "C 600 970 626 1038 644 1084 C 650 1102 654 1118 656 1128"
        ),
        2.9,
        0.43,
        0.40,
    ),
    RootPath(
        "root-east-crown",
        "secondary",
        "root-east",
        (486.0, 770.0),
        (
            "M 486 770 C 516 754 548 750 576 760 "
            "C 612 772 646 798 672 832"
        ),
        3.8,
        0.32,
        0.38,
    ),
    RootPath(
        "root-east-deep",
        "secondary",
        "root-east",
        (602.0, 846.0),
        (
            "M 602 846 C 626 850 650 864 668 884 "
            "C 684 904 696 930 700 958 C 706 990 706 1028 704 1060"
        ),
        3.1,
        0.39,
        0.42,
    ),
    RootPath(
        "root-west-low",
        "secondary",
        "root-southwest",
        (190.0, 1044.0),
        (
            "M 190 1044 C 152 1028 112 1030 82 1052 "
            "C 54 1070 32 1088 18 1112"
        ),
        2.7,
        0.48,
        0.38,
    ),
    RootPath(
        "root-east-low",
        "secondary",
        "root-southeast",
        (552.0, 1040.0),
        (
            "M 552 1040 C 590 1026 626 1034 652 1060 "
            "C 678 1086 696 1118 704 1148"
        ),
        2.7,
        0.49,
        0.37,
    ),
    RootPath(
        "rootlet-west-rise",
        "fine",
        "root-west-crown",
        (178.0, 770.0),
        "M 178 770 C 156 750 130 740 106 742",
        1.6,
        0.58,
        0.30,
    ),
    RootPath(
        "rootlet-west-edge",
        "fine",
        "root-west-crown",
        (88.0, 838.0),
        "M 88 838 C 64 850 34 874 14 900",
        1.4,
        0.62,
        0.32,
    ),
    RootPath(
        "rootlet-west-deep",
        "fine",
        "root-west-deep",
        (112.0, 940.0),
        "M 112 940 C 84 956 48 998 22 1032",
        1.5,
        0.66,
        0.30,
    ),
    RootPath(
        "rootlet-southwest-rise",
        "fine",
        "root-southwest-lateral",
        (240.0, 852.0),
        "M 240 852 C 224 830 202 816 178 814",
        1.7,
        0.59,
        0.31,
    ),
    RootPath(
        "rootlet-southwest-tip",
        "fine",
        "root-southwest-deep",
        (176.0, 956.0),
        "M 176 956 C 142 970 104 1004 70 1046",
        1.3,
        0.69,
        0.28,
    ),
    RootPath(
        "rootlet-center-west",
        "fine",
        "root-center-west",
        (300.0, 900.0),
        "M 300 900 C 270 916 236 962 206 1000",
        1.5,
        0.64,
        0.30,
    ),
    RootPath(
        "rootlet-center-sink",
        "fine",
        "root-center-east",
        (410.0, 1006.0),
        (
            "M 410 1006 C 392 1048 378 1108 366 1144 "
            "C 362 1156 360 1166 358 1172"
        ),
        1.6,
        0.72,
        0.28,
    ),
    RootPath(
        "rootlet-southeast-rise",
        "fine",
        "root-southeast-lateral",
        (510.0, 838.0),
        "M 510 838 C 528 816 552 804 578 806",
        1.7,
        0.61,
        0.32,
    ),
    RootPath(
        "rootlet-southeast-tip",
        "fine",
        "root-southeast-deep",
        (576.0, 946.0),
        "M 576 946 C 616 964 658 1004 694 1042",
        1.4,
        0.68,
        0.29,
    ),
    RootPath(
        "rootlet-east-rise",
        "fine",
        "root-east-crown",
        (576.0, 760.0),
        "M 576 760 C 600 740 628 734 652 740",
        1.8,
        0.60,
        0.31,
    ),
    RootPath(
        "rootlet-east-shoulder",
        "fine",
        "root-east-deep",
        (668.0, 884.0),
        "M 668 884 C 688 870 702 852 706 836",
        1.4,
        0.65,
        0.31,
    ),
    RootPath(
        "rootlet-east-deep",
        "fine",
        "root-east-deep",
        (700.0, 958.0),
        "M 700 958 C 694 1002 692 1068 688 1110 C 686 1118 684 1124 680 1130",
        1.5,
        0.71,
        0.28,
    ),
    RootPath(
        "rootlet-west-low-rise",
        "fine",
        "root-west-low",
        (82.0, 1052.0),
        "M 82 1052 C 60 1030 36 1018 14 1010",
        1.4,
        0.73,
        0.24,
    ),
    RootPath(
        "rootlet-west-low-deep",
        "fine",
        "root-west-low",
        (18.0, 1112.0),
        "M 18 1112 C 30 1128 46 1142 62 1156",
        1.3,
        0.78,
        0.21,
    ),
    RootPath(
        "rootlet-west-basin",
        "fine",
        "root-southwest-deep",
        (116.0, 1092.0),
        "M 116 1092 C 94 1114 68 1148 52 1168",
        1.5,
        0.76,
        0.23,
    ),
    RootPath(
        "rootlet-east-low-rise",
        "fine",
        "root-east-low",
        (652.0, 1060.0),
        "M 652 1060 C 672 1042 690 1028 706 1018",
        1.5,
        0.74,
        0.23,
    ),
    RootPath(
        "rootlet-east-low-deep",
        "fine",
        "root-east-low",
        (704.0, 1148.0),
        "M 704 1148 C 690 1158 674 1164 656 1170",
        1.3,
        0.79,
        0.20,
    ),
    RootPath(
        "rootlet-east-basin",
        "fine",
        "root-southeast-deep",
        (644.0, 1084.0),
        "M 644 1084 C 664 1108 692 1136 690 1158",
        1.5,
        0.77,
        0.22,
    ),
)


def catmull_rom(points: list[Point], per_segment: int = 10) -> list[Point]:
    """Sample a Catmull-Rom spline through the supplied control points."""
    if len(points) < 3:
        return points

    extended = [points[0], *points, points[-1]]
    sampled: list[Point] = []
    for index in range(1, len(extended) - 2):
        p0, p1, p2, p3 = extended[index - 1 : index + 3]
        for step_index in range(per_segment):
            t = step_index / per_segment
            t2 = t * t
            t3 = t2 * t
            x = 0.5 * (
                2 * p1[0]
                + (-p0[0] + p2[0]) * t
                + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2
                + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3
            )
            y = 0.5 * (
                2 * p1[1]
                + (-p0[1] + p2[1]) * t
                + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2
                + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3
            )
            sampled.append((x, y))
    sampled.append(points[-1])
    return sampled


def branch_center(
    start: Point,
    end: Point,
    curve: float,
    *,
    rng: Random,
    wobble: float = 0.0,
) -> list[Point]:
    """Create one gently asymmetric major-limb centerline."""
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    length = hypot(dx, dy) or 1.0
    normal_x, normal_y = -dy / length, dx / length
    lift = abs(dx) * 0.14 if dy < 0 else 0.0
    controls = [
        start,
        (
            start[0] + dx * 0.28 + normal_x * curve * 0.5,
            start[1] + dy * 0.28 + normal_y * curve * 0.5 - lift,
        ),
        (
            start[0] + dx * 0.66 + normal_x * curve * 0.5,
            start[1] + dy * 0.66 + normal_y * curve * 0.5,
        ),
        end,
    ]
    if wobble:
        for index in (1, 2):
            controls[index] = (
                controls[index][0] + rng.uniform(-wobble, wobble),
                controls[index][1] + rng.uniform(-wobble, wobble),
            )
    return catmull_rom(controls, 9)


def taper_widths(count: int, root_width: float, tip_width: float) -> list[float]:
    """Return a strict root-to-tip taper with no collar or initial swelling."""
    widths = [
        tip_width
        + (root_width - tip_width) * (1.0 - index / (count - 1)) ** 1.18
        for index in range(count)
    ]
    assert all(left > right for left, right in zip(widths, widths[1:]))
    return widths


def interpolate_widths(controls: tuple[float, ...], count: int) -> list[float]:
    """Interpolate the trunk width profile across its sampled centerline."""
    widths: list[float] = []
    for index in range(count):
        position = index / (count - 1) * (len(controls) - 1)
        low = int(floor(position))
        high = min(low + 1, len(controls) - 1)
        fraction = position - low
        widths.append(controls[low] + (controls[high] - controls[low]) * fraction)
    return widths


def create_geometry(seed: int = SEED) -> tuple[TreeGeometry, object]:
    """Create every major centerline once and retain the foliage RNG state."""
    rng = Random(seed)
    trunk_center = catmull_rom(
        [
            TRUNK_BASE,
            (354.0, 650.0),
            (366.0, 592.0),
            (348.0, 536.0),
            HUB,
            (362.0, 446.0),
            TRUNK_TOP,
        ],
        12,
    )
    trunk = LimbGeometry(
        "trunk",
        tuple(trunk_center),
        tuple(
            interpolate_widths(
                (66.0, 56.0, 64.0, 52.0, 46.0, 34.0, 22.0),
                len(trunk_center),
            )
        ),
    )

    primary: list[LimbGeometry] = []
    for name, facet in FACETS.items():
        start = (
            facet["start"][0] + rng.uniform(-2.5, 2.5),
            facet["start"][1] + rng.uniform(-2.5, 2.5),
        )
        center = branch_center(
            start,
            facet["node"],
            facet["curve"],
            rng=rng,
            wobble=5.0,
        )
        primary.append(
            LimbGeometry(name, tuple(center), tuple(taper_widths(len(center), 24.0, 3.2)))
        )

    ambient: list[LimbGeometry] = []
    for name, tip, anchor in AMBIENT:
        start = (
            anchor[0] + rng.uniform(-3.0, 3.0),
            anchor[1] + rng.uniform(-3.0, 3.0),
        )
        curve = rng.uniform(-22.0, 22.0)
        center = branch_center(start, tip, curve, rng=rng, wobble=5.5)
        root_width = rng.uniform(14.0, 20.0)
        ambient.append(
            LimbGeometry(name, tuple(center), tuple(taper_widths(len(center), root_width, 2.4)))
        )

    roots: list[LimbGeometry] = []
    for index, tip in enumerate(ROOT_TIPS):
        start = (
            TRUNK_BASE[0] + rng.uniform(-10.0, 10.0),
            TRUNK_BASE[1] - rng.uniform(1.0, 10.0),
        )
        center = branch_center(
            start,
            tip,
            rng.uniform(-18.0, 18.0),
            rng=rng,
            wobble=3.5,
        )
        roots.append(
            LimbGeometry(
                f"root-{index}",
                tuple(center),
                tuple(taper_widths(len(center), rng.uniform(20.0, 30.0), 2.2)),
            )
        )

    return TreeGeometry(
        trunk,
        tuple(primary),
        tuple(ambient),
        tuple(roots),
    ), rng.getstate()


def geometry_capsules(limbs: tuple[LimbGeometry, ...]) -> list[Capsule]:
    """Convert the selected sampled centerlines to tapered implicit capsules."""
    capsules: list[Capsule] = []
    for limb in limbs:
        for index, (start, end) in enumerate(zip(limb.center, limb.center[1:])):
            capsules.append(
                (
                    start[0],
                    start[1],
                    end[0],
                    end[1],
                    limb.widths[index] / 2.0,
                    limb.widths[index + 1] / 2.0,
                )
            )
    return capsules


def segment_distance(
    query_x: float,
    query_y: float,
    start_x: float,
    start_y: float,
    end_x: float,
    end_y: float,
) -> tuple[float, float]:
    """Return distance to a segment and the clamped segment parameter."""
    dx = end_x - start_x
    dy = end_y - start_y
    length_squared = dx * dx + dy * dy
    if length_squared == 0:
        parameter = 0.0
    else:
        parameter = (
            (query_x - start_x) * dx + (query_y - start_y) * dy
        ) / length_squared
        parameter = min(max(parameter, 0.0), 1.0)
    nearest_x = start_x + dx * parameter
    nearest_y = start_y + dy * parameter
    return hypot(query_x - nearest_x, query_y - nearest_y), parameter


def rasterize_capsules(
    capsules: list[Capsule],
    *,
    x0: float,
    y0: float,
    x1: float,
    y1: float,
    step: float,
) -> tuple[bytearray, int, int]:
    """Rasterize locally around each capsule instead of scanning all pairs."""
    columns = int(round((x1 - x0) / step)) + 1
    rows = int(round((y1 - y0) / step)) + 1
    inside = bytearray(columns * rows)

    for start_x, start_y, end_x, end_y, start_radius, end_radius in capsules:
        padding = max(start_radius, end_radius) + step
        first_column = max(0, int(floor((min(start_x, end_x) - padding - x0) / step)))
        last_column = min(columns - 1, int((max(start_x, end_x) + padding - x0) / step) + 1)
        first_row = max(0, int(floor((min(start_y, end_y) - padding - y0) / step)))
        last_row = min(rows - 1, int((max(start_y, end_y) + padding - y0) / step) + 1)

        for row in range(first_row, last_row + 1):
            query_y = y0 + row * step
            offset = row * columns
            for column in range(first_column, last_column + 1):
                cell = offset + column
                if inside[cell]:
                    continue
                query_x = x0 + column * step
                distance, parameter = segment_distance(
                    query_x,
                    query_y,
                    start_x,
                    start_y,
                    end_x,
                    end_y,
                )
                radius = start_radius + (end_radius - start_radius) * parameter
                if distance <= max(radius, step * 0.92):
                    inside[cell] = 1
    return inside, columns, rows


def marching_segments(
    inside: bytearray,
    columns: int,
    rows: int,
    *,
    x0: float,
    y0: float,
    step: float,
) -> list[tuple[Point, Point]]:
    """Extract contour segments with deterministic saddle connectivity."""
    segments: list[tuple[Point, Point]] = []
    for row in range(rows - 1):
        y = y0 + row * step
        for column in range(columns - 1):
            x = x0 + column * step
            top_left = bool(inside[row * columns + column])
            top_right = bool(inside[row * columns + column + 1])
            bottom_right = bool(inside[(row + 1) * columns + column + 1])
            bottom_left = bool(inside[(row + 1) * columns + column])
            case = (
                (8 if top_left else 0)
                | (4 if top_right else 0)
                | (2 if bottom_right else 0)
                | (1 if bottom_left else 0)
            )
            if case in (0, 15):
                continue

            top = (x + step * 0.5, y)
            right = (x + step, y + step * 0.5)
            bottom = (x + step * 0.5, y + step)
            left = (x, y + step * 0.5)

            if case == 5:  # top-right and bottom-left are separate interiors
                segments.extend(((top, right), (bottom, left)))
                continue
            if case == 10:  # top-left and bottom-right are separate interiors
                segments.extend(((left, top), (right, bottom)))
                continue

            crossings: list[Point] = []
            if top_left != top_right:
                crossings.append(top)
            if top_right != bottom_right:
                crossings.append(right)
            if bottom_right != bottom_left:
                crossings.append(bottom)
            if bottom_left != top_left:
                crossings.append(left)
            if len(crossings) == 2:
                segments.append((crossings[0], crossings[1]))
    return segments


def rounded_point(point: Point) -> Point:
    """Normalize shared marching-square endpoints for exact graph lookup."""
    return round(point[0], 4), round(point[1], 4)


def link_closed_loops(segments: list[tuple[Point, Point]]) -> list[list[Point]]:
    """Link the degree-two contour graph into closed loops."""
    indexed: list[list[object]] = []
    endpoints: defaultdict[Point, list[int]] = defaultdict(list)
    for start, end in segments:
        normalized_start = rounded_point(start)
        normalized_end = rounded_point(end)
        indexed.append([normalized_start, normalized_end, False])
        segment_index = len(indexed) - 1
        endpoints[normalized_start].append(segment_index)
        endpoints[normalized_end].append(segment_index)

    loops: list[list[Point]] = []
    for segment in indexed:
        if segment[2]:
            continue
        start = segment[0]
        segment[2] = True
        loop = [segment[0], segment[1]]
        current = segment[1]
        while current != start:
            candidates = [
                index for index in endpoints[current] if not indexed[index][2]
            ]
            if not candidates:
                loop = []
                break
            next_segment = indexed[candidates[0]]
            next_segment[2] = True
            current = (
                next_segment[1]
                if next_segment[0] == current
                else next_segment[0]
            )
            loop.append(current)
        if len(loop) >= 24:
            loops.append(loop)
    return loops


def chaikin(loop: list[Point], iterations: int = 2) -> list[Point]:
    """Round the sampled contour without creating painted internal seams."""
    points = loop[:-1] if loop and loop[0] == loop[-1] else loop[:]
    for _ in range(iterations):
        rounded: list[Point] = []
        for index, point in enumerate(points):
            following = points[(index + 1) % len(points)]
            rounded.append(
                (
                    point[0] * 0.75 + following[0] * 0.25,
                    point[1] * 0.75 + following[1] * 0.25,
                )
            )
            rounded.append(
                (
                    point[0] * 0.25 + following[0] * 0.75,
                    point[1] * 0.25 + following[1] * 0.75,
                )
            )
        points = rounded
    return points


def decimate(points: list[Point], minimum_distance: float = 2.1) -> list[Point]:
    """Keep the generated path compact without changing its topology."""
    if not points:
        return []
    reduced = [points[0]]
    for point in points[1:]:
        if hypot(point[0] - reduced[-1][0], point[1] - reduced[-1][1]) >= minimum_distance:
            reduced.append(point)
    return reduced


def signed_area(loop: list[Point]) -> float:
    """Return polygon area for topology diagnostics."""
    return 0.5 * sum(
        start[0] * end[1] - end[0] * start[1]
        for start, end in zip(loop, (*loop[1:], loop[0]))
    )


def union_outline(limbs: tuple[LimbGeometry, ...], step: float = 1.25) -> list[Point]:
    """Return the sole closed exterior contour for connected static wood."""
    bounds = (16.0, 72.0, 704.0, 804.0)
    inside, columns, rows = rasterize_capsules(
        geometry_capsules(limbs),
        x0=bounds[0],
        y0=bounds[1],
        x1=bounds[2],
        y1=bounds[3],
        step=step,
    )
    segments = marching_segments(
        inside,
        columns,
        rows,
        x0=bounds[0],
        y0=bounds[1],
        step=step,
    )
    loops = link_closed_loops(segments)
    substantial = [loop for loop in loops if abs(signed_area(loop)) > 150.0]
    if len(substantial) != 1:
        areas = sorted(round(abs(signed_area(loop)), 1) for loop in substantial)
        raise ValueError(f"static wood must have one exterior contour, got areas={areas}")
    return decimate(chaikin(substantial[0], 2))


def path_from_points(points: tuple[Point, ...] | list[Point], *, close: bool) -> str:
    """Serialize a sampled path with stable precision."""
    path = "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in points)
    return path + (" Z" if close else "")


def ribbon(center: list[Point], widths: list[float]) -> str:
    """Create a filled tapered twig from a centerline."""
    left: list[Point] = []
    right: list[Point] = []
    for index, point in enumerate(center):
        if index == 0:
            dx = center[1][0] - center[0][0]
            dy = center[1][1] - center[0][1]
        elif index == len(center) - 1:
            dx = center[-1][0] - center[-2][0]
            dy = center[-1][1] - center[-2][1]
        else:
            dx = center[index + 1][0] - center[index - 1][0]
            dy = center[index + 1][1] - center[index - 1][1]
        length = hypot(dx, dy) or 1.0
        normal_x, normal_y = -dy / length, dx / length
        half_width = widths[index] / 2.0
        left.append((point[0] + normal_x * half_width, point[1] + normal_y * half_width))
        right.append((point[0] - normal_x * half_width, point[1] - normal_y * half_width))
    return path_from_points([*left, *reversed(right)], close=True)


def point_and_angle(center: tuple[Point, ...], fraction: float) -> tuple[Point, float]:
    """Interpolate a point and tangent direction on one sampled centerline."""
    position = fraction * (len(center) - 1)
    low = min(int(floor(position)), len(center) - 2)
    high = low + 1
    remainder = position - low
    start, end = center[low], center[high]
    point = (
        start[0] + (end[0] - start[0]) * remainder,
        start[1] + (end[1] - start[1]) * remainder,
    )
    return point, atan2(end[1] - start[1], end[0] - start[0])


def leaf_path(length: float, width: float) -> str:
    """Return one small ink leaf silhouette."""
    return (
        f"M0 0 C {0.5 * width:.1f} {-0.15 * length:.1f}, "
        f"{0.5 * width:.1f} {-0.7 * length:.1f}, 0 {-length:.1f} "
        f"C {-0.5 * width:.1f} {-0.7 * length:.1f}, "
        f"{-0.5 * width:.1f} {-0.15 * length:.1f}, 0 0 Z"
    )


def cluster(
    center_x: float,
    center_y: float,
    count: int,
    radius_minimum: float,
    radius_maximum: float,
    length_minimum: float,
    length_maximum: float,
    *,
    rng: Random,
    shade_chance: float = 0.24,
) -> str:
    """Generate one airy leaf cluster."""
    leaves: list[str] = []
    for _ in range(count):
        angle = rng.uniform(0.0, tau)
        radius = rng.random() ** 0.5 * rng.uniform(radius_minimum, radius_maximum)
        x = center_x + cos(angle) * radius
        y = center_y + sin(angle) * radius * 0.82
        rotation = rng.uniform(-180.0, 180.0)
        scale = rng.uniform(0.7, 1.3)
        length = rng.uniform(length_minimum, length_maximum)
        width = length * rng.uniform(0.34, 0.47)
        class_name = "life-tree__leaf"
        if rng.random() < shade_chance:
            class_name += " life-tree__leaf--shade"
        leaves.append(
            f'          <path class="{class_name}" d="{leaf_path(length, width)}" '
            f'transform="translate({x:.1f} {y:.1f}) rotate({rotation:.1f}) scale({scale:.2f})"/>'
        )
    return (
        f'        <g class="life-tree__cluster" '
        f'style="transform-origin:{center_x:.0f}px {center_y:.0f}px">\n'
        + "\n".join(leaves)
        + "\n        </g>"
    )


def sub_branch(
    start: Point,
    angle: float,
    length: float,
    root_width: float,
    depth: int,
    output: list[str],
    *,
    rng: Random,
) -> None:
    """Generate one recursive twig and the leaf spray at its tip."""
    end = (
        start[0] + cos(angle) * length,
        start[1] + sin(angle) * length,
    )
    center = branch_center(
        start,
        end,
        rng.uniform(-14.0, 14.0),
        rng=rng,
        wobble=4.0,
    )
    widths = taper_widths(len(center), root_width, max(0.7, root_width * 0.28))
    output.append(f'        <path class="life-tree__twig" d="{ribbon(center, widths)}"/>')
    output.append(cluster(end[0], end[1], rng.randint(3, 5), 4, 18, 12, 22, rng=rng))
    if depth > 0 and length > 26:
        for _ in range(rng.randint(1, 2)):
            sub_branch(
                end,
                angle + rng.uniform(-0.7, 0.7),
                length * rng.uniform(0.5, 0.7),
                max(0.8, root_width * 0.5),
                depth - 1,
                output,
                rng=rng,
            )


def roots_markup() -> list[str]:
    """Draw a hierarchical root network that reveals as the journey deepens."""
    output = ['      <g class="life-tree__roots" aria-hidden="true">']
    for root in ROOT_PATHS:
        anchor = f"{root.anchor[0]:.0f} {root.anchor[1]:.0f}"
        output.append(
            f'        <path class="life-tree__root life-tree__root--{root.tier}" '
            f'data-root-id="{root.root_id}" data-root-tier="{root.tier}" '
            f'data-root-parent="{root.parent}" data-root-anchor="{anchor}" '
            f'd="{root.path}" pathLength="1" stroke-width="{root.width:.1f}" '
            f'style="--root-delay:{root.delay:.2f};--root-span:{root.span:.2f}"/>'
        )
    output.append("      </g>")
    return output


def canopy_markup() -> list[str]:
    """Lay a quiet crown wash behind the branch-bound leaf clusters."""
    return [
        '        <g class="life-tree__canopy-mass" aria-hidden="true">',
        '          <path class="life-tree__canopy-shape" d="'
        "M 42 357 "
        "C 48 319 72 294 109 286 "
        "C 82 248 102 205 145 194 "
        "C 140 153 177 124 221 137 "
        "C 239 91 291 79 327 105 "
        "C 351 69 408 73 429 111 "
        "C 468 84 520 105 523 150 "
        "C 568 127 614 158 608 204 "
        "C 655 207 681 247 660 287 "
        "C 697 305 704 351 676 378 "
        "C 646 408 600 407 570 391 "
        "C 542 430 492 439 455 413 "
        "C 424 449 370 455 337 424 "
        "C 296 452 242 438 221 400 "
        "C 176 426 126 410 119 374 "
        "C 84 390 50 380 42 357 Z"
        '"/>',
        '          <path class="life-tree__canopy-shape life-tree__canopy-shape--under" d="'
        "M 96 382 C 118 334 171 318 215 344 "
        "C 245 307 303 312 329 350 "
        "C 366 319 421 327 444 364 "
        "C 482 335 542 351 557 396 "
        "C 522 426 470 429 435 408 "
        "C 397 438 341 440 306 411 "
        "C 256 438 188 423 168 390 "
        "C 139 401 112 397 96 382 Z"
        '"/>',
        "        </g>",
    ]


def bark_markup() -> list[str]:
    """Add sparse woodcut grain to the planted trunk."""
    return [
        '        <g class="life-tree__bark" aria-hidden="true">',
        '          <path d="M 349 668 C 358 632 348 602 359 567" stroke-width="3.0"/>',
        '          <path d="M 381 690 C 369 653 381 620 368 583" stroke-width="2.2"/>',
        '          <path d="M 341 616 C 350 590 345 565 354 543" stroke-width="1.6"/>',
        '          <path d="M 374 550 C 363 530 371 507 361 487" stroke-width="1.8"/>',
        "        </g>",
        '        <g class="life-tree__bark life-tree__bark--light" aria-hidden="true">',
        '          <path d="M 365 676 C 358 642 369 614 360 585" stroke-width="1.4"/>',
        '          <path d="M 353 564 C 363 541 355 520 366 499" stroke-width="1.0"/>',
        "        </g>",
    ]


def branch_markup(geometry: TreeGeometry) -> list[str]:
    """Paint every crown limb as a breeze-bound tapered ribbon."""
    output = ['        <g class="life-tree__limbs" aria-hidden="true">']
    for limb in (*geometry.primary, *geometry.ambient):
        modifier = " life-tree__limb--primary" if limb in geometry.primary else ""
        output.append(
            f'          <path class="life-tree__limb{modifier}" '
            f'd="{ribbon(list(limb.center), list(limb.widths))}"/>'
        )
    output.append("        </g>")
    return output


def foliage_markup(geometry: TreeGeometry, rng_state: object) -> list[str]:
    """Generate edge detail over the crown without dissolving its silhouette."""
    rng = Random()
    rng.setstate(rng_state)
    output: list[str] = []

    for limb in geometry.primary:
        lower_point, lower_angle = point_and_angle(limb.center, 0.43)
        lower_side = rng.choice((-1, 1))
        sub_branch(
            lower_point,
            lower_angle + lower_side * rng.uniform(0.48, 0.76),
            rng.uniform(28.0, 44.0),
            rng.uniform(2.6, 3.8),
            0,
            output,
            rng=rng,
        )
        point, angle = point_and_angle(limb.center, 0.62)
        side = rng.choice((-1, 1))
        sub_branch(
            point,
            angle + side * rng.uniform(0.55, 0.95),
            rng.uniform(38.0, 60.0),
            rng.uniform(3.4, 4.8),
            0,
            output,
            rng=rng,
        )
        point, _ = point_and_angle(limb.center, 0.8)
        output.append(
            cluster(point[0], point[1], rng.randint(4, 6), 5, 22, 17, 30, rng=rng)
        )
        tip = limb.center[-1]
        output.append(cluster(tip[0], tip[1], rng.randint(5, 7), 4, 24, 17, 31, rng=rng))

    for limb in geometry.ambient:
        tip = limb.center[-1]
        output.append(cluster(tip[0], tip[1], rng.randint(4, 6), 4, 23, 17, 30, rng=rng))

    crown_centers = (
        (98, 330), (216, 145), (320, 105), (538, 164), (630, 266),
    )
    for center_x, center_y in crown_centers:
        x = center_x + rng.uniform(-15.0, 15.0)
        y = center_y + rng.uniform(-13.0, 13.0)
        output.append(cluster(x, y, rng.randint(4, 6), 5, 24, 18, 31, rng=rng))
    return output


def build(seed: int = SEED) -> str:
    """Build the complete deterministic SVG fragment."""
    geometry, foliage_state = create_geometry(seed)
    wood = path_from_points(
        union_outline((geometry.trunk, *geometry.roots)),
        close=True,
    )
    output = roots_markup()
    output.extend(
        (
            '      <g class="life-tree__wood" aria-hidden="true">',
            f'        <path class="life-tree__wood-shape" d="{wood}"/>',
            "      </g>",
        )
    )
    output.extend(bark_markup())
    output.append('      <g class="life-tree__breeze">')
    output.extend(canopy_markup())
    output.extend(branch_markup(geometry))
    output.append('        <g class="life-tree__foliage" aria-hidden="true">')
    output.extend(foliage_markup(geometry, foliage_state))
    output.extend(("        </g>", "      </g>"))

    output.append('      <g class="life-tree__hit-branches">')
    for limb in geometry.primary:
        label = limb.name.capitalize()
        output.append(
            f'        <path class="life-tree__branch-hit" '
            f'data-tree-branch="{limb.name}" d="{path_from_points(limb.center, close=False)}" '
            f'tabindex="0" role="link" aria-label="Open {label} dossier"/>'
        )
    output.append("      </g>")

    output.append('      <g class="life-tree__nodes">')
    for name, facet in FACETS.items():
        x, y = facet["node"]
        output.append(
            f'        <circle cx="{x:.0f}" cy="{y:.0f}" r="5.5" '
            f'data-tree-node="{name}" aria-hidden="true"/>'
        )
    for x, y in (
        (350, 388), (360, 474), (362, 568), (294, 326),
        (424, 324), (234, 292), (486, 300),
    ):
        output.append(f'        <circle cx="{x}" cy="{y}" r="3.4" aria-hidden="true"/>')
    output.append("      </g>")

    output.append('      <g class="life-tree__pixels" aria-hidden="true">')
    for x, y, width, height in (
        (86, 280, 7, 7), (212, 172, 5, 5), (344, 106, 6, 6),
        (494, 182, 5, 5), (624, 268, 7, 7), (282, 354, 5, 5),
        (438, 352, 6, 6), (356, 242, 4, 4),
    ):
        output.append(
            f'        <rect x="{x}" y="{y}" width="{width}" '
            f'height="{height}" rx="1.2"/>'
        )
    output.append("      </g>")
    return "\n".join(output)


def validate(markup: str) -> bool:
    """Validate deterministic geometry and semantic output contracts."""
    expected = list(FACETS)
    root_by_id: dict[str, RootPath] = {}
    coordinates_by_id: dict[str, set[Point]] = {}
    tier_counts = {
        tier: sum(root.tier == tier for root in ROOT_PATHS)
        for tier in ("primary", "secondary", "fine")
    }
    assert tier_counts == {"primary": 5, "secondary": 12, "fine": 18}

    primary_terminal_depths: set[float] = set()
    reveal_ends: list[float] = []
    for root in ROOT_PATHS:
        assert root.root_id not in root_by_id
        assert root.tier in tier_counts
        anchor = f"{root.anchor[0]:.0f} {root.anchor[1]:.0f}"
        assert root.path.startswith(f"M {anchor}")

        numbers = [
            float(value)
            for value in re.findall(r"-?\d+(?:\.\d+)?", root.path)
        ]
        assert len(numbers) % 2 == 0
        points = set(zip(numbers[::2], numbers[1::2]))
        assert min(point[0] for point in points) - root.width / 2 >= 12.0
        assert max(point[0] for point in points) + root.width / 2 <= 708.0
        assert min(point[1] for point in points) - root.width / 2 >= 696.0
        assert max(point[1] for point in points) + root.width / 2 <= 1173.0

        if root.tier == "primary":
            assert root.parent == "trunk"
            primary_terminal_depths.add(numbers[-1])
        else:
            assert root.parent in root_by_id
            parent = root_by_id[root.parent]
            expected_parent_tier = (
                "primary" if root.tier == "secondary" else "secondary"
            )
            assert parent.tier == expected_parent_tier
            assert root.anchor in coordinates_by_id[root.parent]
            assert root.delay > parent.delay

        reveal_end = root.delay + root.span
        assert 0.0 <= root.delay < 1.0
        assert 0.0 < root.span <= 1.0
        assert reveal_end <= 1.0
        reveal_ends.append(reveal_end)
        root_by_id[root.root_id] = root
        coordinates_by_id[root.root_id] = points

    assert len(primary_terminal_depths) == 5
    assert max(primary_terminal_depths) - min(primary_terminal_depths) >= 180.0
    assert round(max(reveal_ends), 10) == 1.0

    assert re.findall(r'data-tree-branch="([^"]+)"', markup) == expected
    assert re.findall(r'data-tree-node="([^"]+)"', markup) == expected
    assert re.findall(r'data-root-id="([^"]+)"', markup) == [
        root.root_id for root in ROOT_PATHS
    ]
    assert {
        tier: markup.count(f'data-root-tier="{tier}"')
        for tier in ("primary", "secondary", "fine")
    } == tier_counts
    assert markup.count('class="life-tree__wood-shape"') == 1
    assert markup.count('class="life-tree__breeze"') == 1
    assert markup.count('class="life-tree__roots"') == 1
    assert markup.count('class="life-tree__canopy-shape"') == 1
    assert markup.count('class="life-tree__cluster"') == 35
    assert len(re.findall(r'<path class="life-tree__leaf(?: |")', markup)) == 176
    wood_match = re.search(r'class="life-tree__wood-shape" d="([^"]+)"', markup)
    assert wood_match is not None
    assert len(re.findall(r"(?:^|\s)M\s", wood_match.group(1))) == 1
    assert "nan" not in markup.lower()
    assert "inf" not in markup.lower()
    for token in re.findall(r"-?\d+(?:\.\d+)?", markup):
        assert isfinite(float(token))

    geometry, _ = create_geometry()
    for limb in (*geometry.primary, *geometry.ambient, *geometry.roots):
        assert all(left > right for left, right in zip(limb.widths, limb.widths[1:]))
    assert max(limb.widths[0] for limb in geometry.primary) < max(geometry.trunk.widths)
    return True


def main() -> None:
    """Write the generated fragment to the local scratch exchange file."""
    markup = build()
    validate(markup)
    assert markup == build(), "fixed-seed generation must be deterministic"
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(markup + "\n", encoding="utf-8")
    print(f"wrote {OUTPUT.relative_to(ROOT)}; one wood contour + five hit branches")


if __name__ == "__main__":
    main()
