#!/usr/bin/env python3
"""Generate the deterministic living-index tree SVG fragment.

Visible wood and interactive geometry are deliberately separate. One sampled
exterior contour paints the trunk and major limbs. Five transparent paths reuse
the exact primary-limb centerlines for pointer and keyboard interaction.
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

HUB = (360.0, 478.0)
TRUNK_BASE = (360.0, 708.0)
TRUNK_TOP = (360.0, 408.0)

FACETS = {
    "work": {"node": (96.0, 256.0), "offset": -10.0, "curve": -30.0},
    "make": {"node": (220.0, 176.0), "offset": -5.0, "curve": -16.0},
    "serve": {"node": (360.0, 116.0), "offset": 0.0, "curve": 4.0},
    "learn": {"node": (500.0, 176.0), "offset": 5.0, "curve": 16.0},
    "life": {"node": (624.0, 256.0), "offset": 10.0, "curve": 30.0},
}

AMBIENT = (
    ("up-left", (150.0, 150.0)),
    ("up", (330.0, 148.0)),
    ("up-right", (572.0, 150.0)),
    ("left-mid", (120.0, 330.0)),
    ("right-mid", (600.0, 330.0)),
    ("low-left", (210.0, 410.0)),
    ("low-right", (510.0, 410.0)),
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
class TreeGeometry:
    """The single geometry model used by paint and interaction output."""

    trunk: LimbGeometry
    primary: tuple[LimbGeometry, ...]
    ambient: tuple[LimbGeometry, ...]


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
            (360.0, TRUNK_BASE[1]),
            (357.0, 612.0),
            (364.0, 545.0),
            (360.0, HUB[1]),
            (361.0, 442.0),
            (360.0, TRUNK_TOP[1]),
        ],
        12,
    )
    trunk = LimbGeometry(
        "trunk",
        tuple(trunk_center),
        tuple(interpolate_widths((20.0, 22.0, 26.0, 30.0, 22.0, 15.0), len(trunk_center))),
    )

    primary: list[LimbGeometry] = []
    for name, facet in FACETS.items():
        start = (
            HUB[0] + facet["offset"] + rng.uniform(-2.5, 2.5),
            HUB[1] + rng.uniform(8.0, 20.0),
        )
        center = branch_center(
            start,
            facet["node"],
            facet["curve"],
            rng=rng,
            wobble=5.0,
        )
        primary.append(
            LimbGeometry(name, tuple(center), tuple(taper_widths(len(center), 12.5, 2.4)))
        )

    ambient: list[LimbGeometry] = []
    for name, tip in AMBIENT:
        start = (
            HUB[0] + rng.uniform(-7.0, 7.0),
            HUB[1] + rng.uniform(7.0, 18.0),
        )
        curve = rng.uniform(-15.0, 15.0)
        center = branch_center(start, tip, curve, rng=rng, wobble=5.5)
        root_width = rng.uniform(9.0, 11.0)
        ambient.append(
            LimbGeometry(name, tuple(center), tuple(taper_widths(len(center), root_width, 2.0)))
        )

    return TreeGeometry(trunk, tuple(primary), tuple(ambient)), rng.getstate()


def geometry_capsules(geometry: TreeGeometry) -> list[Capsule]:
    """Convert sampled centerlines to tapered implicit capsules."""
    capsules: list[Capsule] = []
    for limb in (geometry.trunk, *geometry.primary, *geometry.ambient):
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


def union_outline(geometry: TreeGeometry, step: float = 1.25) -> list[Point]:
    """Return the sole closed exterior contour for all visible major wood."""
    bounds = (20.0, 88.0, 700.0, 720.0)
    inside, columns, rows = rasterize_capsules(
        geometry_capsules(geometry),
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
        raise ValueError(f"wood union must have one exterior contour, got areas={areas}")
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


def foliage_markup(geometry: TreeGeometry, rng_state: object) -> list[str]:
    """Generate secondary twigs and preserve the established canopy density."""
    rng = Random()
    rng.setstate(rng_state)
    output: list[str] = []

    for limb in geometry.primary:
        for fraction in (0.32, 0.52, 0.72):
            point, angle = point_and_angle(limb.center, fraction)
            side = rng.choice((-1, 1))
            sub_branch(
                point,
                angle + side * rng.uniform(0.5, 1.0),
                rng.uniform(40.0, 78.0),
                rng.uniform(3.0, 4.6),
                2,
                output,
                rng=rng,
            )
        for fraction in (0.34, 0.48, 0.62, 0.76, 0.9):
            point, _ = point_and_angle(limb.center, fraction)
            output.append(
                cluster(point[0], point[1], rng.randint(6, 9), 6, 26, 14, 26, rng=rng)
            )
        tip = limb.center[-1]
        output.append(cluster(tip[0], tip[1], rng.randint(5, 8), 4, 22, 12, 22, rng=rng))

    for limb in geometry.ambient:
        for fraction in (0.4, 0.65, 0.85):
            point, angle = point_and_angle(limb.center, fraction)
            side = rng.choice((-1, 1))
            sub_branch(
                point,
                angle + side * rng.uniform(0.5, 1.0),
                rng.uniform(34.0, 64.0),
                rng.uniform(2.6, 4.0),
                2,
                output,
                rng=rng,
            )
        tip = limb.center[-1]
        output.append(cluster(tip[0], tip[1], rng.randint(5, 8), 5, 22, 13, 23, rng=rng))

    crown_centers = (
        (200, 250), (300, 210), (360, 200), (430, 210), (520, 250),
        (160, 330), (260, 300), (360, 300), (470, 300), (560, 330),
        (240, 380), (360, 370), (480, 380), (330, 250), (400, 260),
    )
    for center_x, center_y in crown_centers:
        if rng.random() < 0.12:
            continue
        x = center_x + rng.uniform(-26.0, 26.0)
        y = center_y + rng.uniform(-22.0, 22.0)
        output.append(cluster(x, y, rng.randint(6, 10), 8, 30, 14, 25, rng=rng))
    return output


def build(seed: int = SEED) -> str:
    """Build the complete deterministic SVG fragment."""
    geometry, foliage_state = create_geometry(seed)
    wood = path_from_points(union_outline(geometry), close=True)
    output = ['      <g class="life-tree__breeze">']
    output.extend(
        (
            '        <g class="life-tree__wood" aria-hidden="true">',
            f'          <path class="life-tree__wood-shape" d="{wood}"/>',
            "        </g>",
            '        <g class="life-tree__foliage" aria-hidden="true">',
        )
    )
    output.extend(foliage_markup(geometry, foliage_state))
    output.append("        </g>")

    output.append('        <g class="life-tree__hit-branches">')
    for limb in geometry.primary:
        label = limb.name.capitalize()
        output.append(
            f'          <path class="life-tree__branch-hit" '
            f'data-tree-branch="{limb.name}" d="{path_from_points(limb.center, close=False)}" '
            f'tabindex="0" role="link" aria-label="Open {label} dossier"/>'
        )
    output.append("        </g>")

    output.append('        <g class="life-tree__nodes">')
    for name, facet in FACETS.items():
        x, y = facet["node"]
        output.append(
            f'          <circle cx="{x:.0f}" cy="{y:.0f}" r="5.5" '
            f'data-tree-node="{name}" aria-hidden="true"/>'
        )
    for x, y in (
        (360, 360), (360, 470), (360, 560), (300, 320),
        (420, 320), (240, 300), (480, 300),
    ):
        output.append(f'          <circle cx="{x}" cy="{y}" r="3.4" aria-hidden="true"/>')
    output.append("        </g>")

    output.append('        <g class="life-tree__pixels" aria-hidden="true">')
    for x, y, width, height in (
        (90, 250, 7, 7), (214, 170, 5, 5), (354, 110, 6, 6),
        (494, 170, 5, 5), (618, 250, 7, 7), (286, 360, 5, 5),
        (434, 360, 6, 6), (360, 250, 4, 4),
    ):
        output.append(
            f'          <rect x="{x}" y="{y}" width="{width}" '
            f'height="{height}" rx="1.2"/>'
        )
    output.extend(("        </g>", "      </g>"))
    return "\n".join(output)


def validate(markup: str) -> bool:
    """Validate deterministic geometry and semantic output contracts."""
    expected = list(FACETS)
    assert re.findall(r'data-tree-branch="([^"]+)"', markup) == expected
    assert re.findall(r'data-tree-node="([^"]+)"', markup) == expected
    assert markup.count('class="life-tree__wood-shape"') == 1
    assert markup.count('class="life-tree__breeze"') == 1
    wood_match = re.search(r'class="life-tree__wood-shape" d="([^"]+)"', markup)
    assert wood_match is not None
    assert len(re.findall(r"(?:^|\s)M\s", wood_match.group(1))) == 1
    assert "nan" not in markup.lower()
    assert "inf" not in markup.lower()
    for token in re.findall(r"-?\d+(?:\.\d+)?", markup):
        assert isfinite(float(token))

    geometry, _ = create_geometry()
    for limb in (*geometry.primary, *geometry.ambient):
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
