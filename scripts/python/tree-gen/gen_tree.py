#!/usr/bin/env python3
"""Regenerate the living-index tree as hand-drawn tapered pencil shapes.

v2 - masterpiece pass:
  - trunk with real mass: strong taper, asymmetric buttress lobes,
    branch collars at limb junctions, livelier edge wobble,
  - roots that grip like a real tree: heavy sinkers flowing from the
    flare, diving down-and-out, forking once into laterals and feeders;
    nothing renders as a horizontal speed line,
  - fuller crown: ten overlapping canopy masses closing the gaps between
    labeled branches, denser leaf clusters on every rim,

The generator emits two fragments and splices them into docs/index.md
between gen_tree marker comments, so the published markup is always
reproducible from this repository:

  <!-- gen_tree:roots -->   roots fragment (life-tree__roots group)
  <!-- gen_tree:tree -->    wood, bark, breeze, foliage, hit branches

Everything between markers is generated; everything around them (title,
desc, nodes, pixels) stays hand-maintained.

Usage:
  uv run python scripts/python/tree-gen/gen_tree.py             # resync docs/index.md
  uv run python scripts/python/tree-gen/gen_tree.py --check     # exit 1 on drift
  uv run python scripts/python/tree-gen/gen_tree.py --fragments DIR  # keep raw fragments too
"""
import argparse
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
INDEX = ROOT / "docs" / "index.md"

REGION_NAMES = ("roots", "tree")
REGION_RES = {
    name: re.compile(
        r"(?s)(?P<indent>[ \t]*)<!-- gen_tree:%s -->\n"
        r".*?\n"
        r"(?P=indent)<!-- /gen_tree:%s -->" % (name, name)
    )
    for name in REGION_NAMES
}

VB_W, VB_H = 720, 1200


# ── geometry helpers ─────────────────────────────────────────────────────
def sample_cubic(p0, p1, p2, p3, n=24):
    pts = []
    for i in range(n + 1):
        t = i / n
        mt = 1 - t
        x = mt**3*p0[0] + 3*mt*mt*t*p1[0] + 3*mt*t*t*p2[0] + t**3*p3[0]
        y = mt**3*p0[1] + 3*mt*mt*t*p1[1] + 3*mt*t*t*p2[1] + t**3*p3[1]
        pts.append((x, y))
    return pts


def sample_chain(chain, n_per_seg=24):
    """Catmull-Rom through arbitrary waypoints -> dense sampled polyline."""
    pts_in = [tuple(p) for p in chain]
    n = len(pts_in)
    if n < 2:
        raise ValueError("need at least 2 waypoints")
    if n == 2:
        pts_in = [pts_in[0], pts_in[0], pts_in[1], pts_in[1]]
        n = 4
    pts = []
    segs = n - 1
    for i in range(segs):
        p0 = pts_in[max(i - 1, 0)]
        p1 = pts_in[i]
        p2 = pts_in[i + 1]
        p3 = pts_in[min(i + 2, segs)]
        s = sample_cubic(
            p1,
            (p1[0] + (p2[0] - p0[0]) / 6.0, p1[1] + (p2[1] - p0[1]) / 6.0),
            (p2[0] - (p3[0] - p1[0]) / 6.0, p2[1] - (p3[1] - p1[1]) / 6.0),
            p2,
            n_per_seg,
        )
        if i > 0:
            s = s[1:]
        pts.extend(s)
    return pts


def cr_to_cubic_d(chain):
    """Catmull-Rom waypoints -> compact smooth 'M..C..' path data."""
    p = [tuple(q) for q in chain]
    if len(p) == 2:
        p = [p[0], p[0], p[1], p[1]]
    ext = [p[0]] + p + [p[-1]]
    parts = [f"M {fmt(p[0][0])} {fmt(p[0][1])}"]
    for i in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[i - 1], ext[i], ext[i + 1], ext[i + 2]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6.0, p1[1] + (p2[1] - p0[1]) / 6.0)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6.0, p2[1] - (p3[1] - p1[1]) / 6.0)
        parts.append(f"C {fmt(c1[0])} {fmt(c1[1])} {fmt(c2[0])} {fmt(c2[1])} {fmt(p2[0])} {fmt(p2[1])}")
    return " ".join(parts)


def tangents(pts):
    tans = []
    for i in range(len(pts)):
        if i == 0:
            dx, dy = pts[1][0]-pts[0][0], pts[1][1]-pts[0][1]
        elif i == len(pts)-1:
            dx, dy = pts[-1][0]-pts[-2][0], pts[-1][1]-pts[-2][1]
        else:
            dx, dy = pts[i+1][0]-pts[i-1][0], pts[i+1][1]-pts[i-1][1]
        L = math.hypot(dx, dy) or 1.0
        tans.append((dx/L, dy/L))
    return tans


def arclens(pts):
    s, out = 0.0, [0.0]
    for i in range(1, len(pts)):
        s += math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1])
        out.append(s)
    return out


def fmt(v):
    return f"{v:.1f}".rstrip('0').rstrip('.')


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def tapered_shape(chain, w0, w1, seed=1, taper_pow=0.85, buttress=0.0,
                  wob=0.7, tip_sharp=True, collars=()):
    """Emit a closed tapered filled path around a chained centerline."""
    pts = sample_chain(chain)
    tans = tangents(pts)
    arcs = arclens(pts)
    total = arcs[-1]
    ph = seed * 2.399963
    left, right = [], []
    for i, ((x, y), (tx, ty)) in enumerate(zip(pts, tans)):
        t = arcs[i] / total
        # width profile: power taper + asymmetric buttress lobes + collars
        w = w0 + (w1 - w0) * (t ** taper_pow)
        if buttress:
            w += buttress * 0.72 * math.exp(-((t - 0.015) / 0.085) ** 2)
            w += buttress * 0.46 * math.exp(-((t - 0.075) / 0.075) ** 2)
            w += buttress * 0.22 * math.exp(-((t - 0.150) / 0.070) ** 2)
        for tc, bump in collars:
            w += bump * math.exp(-((t - tc) / 0.028) ** 2)
        # hand-drawn edge wobble (low-frequency, deterministic per seed);
        # extra rumple near the base so the flare feels grown, not extruded
        wob_amp = wob * max(w, 2.0) / 10.0 * (1.0 + 1.4 * math.exp(-(t / 0.16) ** 2))
        n1 = math.sin(arcs[i] * 0.055 + ph) * 0.6 + math.sin(arcs[i] * 0.021 + ph * 1.7) * 0.4
        n2 = math.sin(arcs[i] * 0.093 + ph * 2.3)
        w_l = w * (1 + wob_amp * (n1 + 0.35 * n2) / max(w, 1))
        w_r = w * (1 - wob_amp * (n1 - 0.35 * n2) / max(w, 1))
        nx, ny = -ty, tx
        left.append((x + nx * w_l / 2, y + ny * w_l / 2))
        right.append((x - nx * w_r / 2, y - ny * w_r / 2))
    right.reverse()
    outline = left + ([pts[-1]] if tip_sharp else []) + right
    d = "M " + " L ".join(f"{fmt(x)} {fmt(y)}" for x, y in outline) + " Z"
    return d


def cloud(cx, cy, R, seed=1, squash=0.92, lobes=None):
    """Scalloped canopy mass: radial noise on a squashed circle."""
    ph1, ph2, ph3 = (seed * 1.7 * k for k in (1.0, 2.1, 3.7))
    a1, a2, a3 = lobes or (0.055, 0.042, 0.028)
    f2, f3 = 8, 13
    pts = []
    N = 96
    for i in range(N):
        th = 2 * math.pi * i / N
        r = R * (1 + a1*math.sin(5*th+ph1) + a2*math.sin(f2*th+ph2) + a3*math.sin(f3*th+ph3))
        x = cx + r * math.cos(th)
        y = cy + r * math.sin(th) * squash
        pts.append((x, y))
    return "M " + " L ".join(f"{fmt(x)} {fmt(y)}" for x, y in pts) + " Z"


LEAF_TMPL = "M0 0 C {w} -{h1}, {w} -{h2}, 0 -{H} C -{w} -{h2}, -{w} -{h1}, 0 0 Z"


def leaf(w, H, x, y, rot, scale, shade=False):
    h1 = H * 0.23
    h2 = H * 0.71
    cls = "life-tree__leaf life-tree__leaf--shade" if shade else "life-tree__leaf"
    return (f'              <path class="{cls}" d="{LEAF_TMPL.format(w=fmt(w), h1=fmt(h1), h2=fmt(h2), H=fmt(H))}" '
            f'transform="translate({fmt(x)} {fmt(y)}) rotate({fmt(rot)}) scale({scale:.2f})"/>')


def cluster(leaves, cx, cy):
    body = "\n".join(leaves)
    return (f'            <g class="life-tree__cluster" style="transform-origin:{fmt(cx)}px {fmt(cy)}px">\n'
            f'{body}\n'
            f'            </g>')


# ── authored architecture ────────────────────────────────────────────────
# Trunk: gentle S-lean, planted wide, narrowing into the crown.
TRUNK_CHAIN = [(358, 714), (344, 664), (355, 610), (366, 554), (369, 504), (367, 476)]

LIMBS = [
    # (name, chain, w0, w1, seed, primary?)
    ("work",  [(350, 552), (310, 524), (256, 490), (202, 450), (164, 418)], 19, 3.8, 3, True),
    ("make",  [(356, 512), (320, 468), (266, 404), (204, 344), (156, 302)], 16, 3.2, 5, True),
    ("serve", [(362, 484), (351, 420), (331, 330), (299, 252), (271, 208)], 15, 3.0, 7, True),
    ("learn", [(367, 478), (369, 396), (374, 292), (381, 208), (385, 164)], 14, 2.8, 9, True),
    ("east",  [(371, 492), (404, 428), (446, 348), (492, 280), (524, 236)], 14, 2.8, 11, True),
    ("life",  [(377, 526), (428, 492), (492, 450), (556, 404), (598, 372)], 17, 3.4, 13, True),
]

SECONDARIES = [
    ([(238, 474), (216, 452), (192, 428), (170, 404)], 6.5, 1.7, 17),
    ([(262, 400), (232, 366), (200, 330), (176, 304)], 6.0, 1.6, 19),
    ([(334, 332), (314, 292), (292, 256), (274, 226)], 5.5, 1.5, 21),
    ([(373, 322), (390, 282), (408, 244), (426, 210)], 5.5, 1.5, 23),
    ([(452, 342), (474, 306), (496, 272), (514, 246)], 5.5, 1.5, 25),
    ([(500, 454), (530, 428), (560, 402), (584, 380)], 6.0, 1.6, 27),
    ([(400, 438), (420, 410), (440, 384), (456, 362)], 4.5, 1.3, 29),
]

TWIGS = [
    ([(150, 424), (128, 414), (108, 408)], 2.2, 0.7, 31),
    ([(136, 282), (116, 272), (98, 268)], 2.0, 0.7, 33),
    ([(246, 186), (228, 174), (212, 168)], 2.0, 0.7, 35),
    ([(396, 132), (414, 120), (430, 114)], 2.0, 0.7, 37),
    ([(540, 208), (558, 198), (574, 194)], 2.0, 0.7, 39),
    ([(618, 350), (636, 342), (650, 338)], 2.0, 0.7, 41),
    ([(300, 176), (286, 164), (274, 156)], 1.8, 0.6, 43),
    ([(470, 220), (486, 210), (500, 204)], 1.8, 0.6, 45),
]

# Crown: ten overlapping masses closing every gap between the labeled
# branches; radii up ~12% over v1 for a lush read.
MASSES = [
    (150, 396, 80, 2),
    (128, 282, 74, 3),
    (250, 186, 84, 4),
    (382, 140, 94, 5),
    (520, 210, 82, 6),
    (606, 350, 70, 7),
    (322, 290, 64, 8),
    (210, 332, 60, 9),
    (452, 158, 66, 10),
    (562, 278, 58, 11),
]

BARK_DARK = [
    ("M 347 672 C 357 634 346 602 358 566", 3.0),
    ("M 383 694 C 370 656 383 620 369 582", 2.2),
    ("M 340 618 C 349 592 344 566 353 544", 1.6),
    ("M 375 550 C 364 530 372 507 362 487", 1.8),
    ("M 352 642 C 346 620 356 602 350 582", 1.2),
    ("M 366 600 C 373 578 364 560 371 540", 1.1),
]
BARK_LIGHT = [
    ("M 364 678 C 357 644 368 614 359 585", 1.4),
    ("M 352 564 C 362 541 354 520 365 499", 1.0),
    ("M 371 632 C 377 610 369 592 375 572", 0.9),
]

# ── roots: heavy sinkers from the flare, diving down-and-out ────────────
# Each entry: (chain, width, tier, delay). Tiers: primary (the
# buttress continuations), lateral (first forks), fine (feeders).
# Spines are authored asymmetric on purpose: west and east differ in
# depth, rhythm, and reach; the taproot forks once into a long shallow
# wander and a short steep drop, never a mirrored V. Every consecutive
# waypoint descends - long travel happens below the ground line.
ROOTS = [
    # primaries: the buttress continuations
    ([(340, 700), (320, 730), (305, 772), (296, 820), (288, 872)], 7.0, "primary", 0.00),
    ([(382, 702), (402, 736), (420, 780), (432, 832), (442, 884)], 7.0, "primary", 0.03),
    ([(332, 706), (298, 726), (260, 754), (222, 788), (200, 830), (192, 872)], 5.0, "primary", 0.06),
    ([(390, 706), (426, 726), (464, 750), (500, 780), (530, 818)], 5.0, "primary", 0.09),
    ([(360, 710), (357, 756), (362, 806), (372, 862), (380, 910)], 6.0, "primary", 0.12),
    # laterals: fork downward off a parent, each unlike its sibling
    ([(288, 872), (270, 908), (250, 954)], 3.2, "lateral", 0.22),
    ([(288, 872), (301, 914), (307, 958)], 2.3, "lateral", 0.26),
    ([(442, 884), (459, 922), (473, 966)], 3.4, "lateral", 0.25),
    ([(442, 884), (431, 924), (423, 960)], 2.4, "lateral", 0.29),
    ([(200, 830), (183, 868), (171, 908)], 2.7, "lateral", 0.28),
    ([(530, 818), (549, 854), (563, 894)], 2.6, "lateral", 0.31),
    ([(372, 862), (356, 906), (338, 950), (329, 988)], 2.9, "lateral", 0.34),
    ([(380, 910), (392, 947), (401, 980)], 2.1, "lateral", 0.37),
    # fine feeders: sparse hair strokes, visibly subordinate
    ([(305, 772), (290, 800), (281, 836)], 1.7, "fine", 0.30),
    ([(420, 780), (436, 810), (449, 843)], 1.7, "fine", 0.32),
    ([(240, 770), (226, 801), (217, 834)], 1.4, "fine", 0.36),
    ([(464, 750), (478, 781), (491, 813)], 1.4, "fine", 0.38),
    ([(296, 820), (283, 851), (276, 884)], 1.3, "fine", 0.40),
    ([(362, 806), (347, 838), (337, 872)], 1.2, "fine", 0.42),
    ([(432, 832), (420, 861), (414, 888)], 1.2, "fine", 0.44),
]

# Draw speed per tier, in viewBox units consumed per unit of reveal
# progress: thick wood crawls with slow authority while fine feeders
# flick out quickly. A root's --root-span derives from its own chain
# length divided by its tier speed, so long strokes never streak.
ROOT_SPEED = {"primary": 620.0, "lateral": 470.0, "fine": 430.0}
SPAN_MIN, SPAN_MAX = 0.12, 0.34


def undulate(chain, amp=4.5, seed=1):
    """Weave a coarse spine into an organic centerline, endpoints pinned.

    Low-frequency perpendicular offsets fade to zero at both ends so
    child roots stay attached to their parents' exact joints; the seed
    gives every root its own phase, so mirrored placements never render
    as matching curves.
    """
    pts = sample_chain(chain, n_per_seg=12)
    arcs = arclens(pts)
    total = arcs[-1] or 1.0
    tans = tangents(pts)
    ph = seed * 2.399963
    n_targets = max(4, min(9, int(total / 55)))
    out = []
    for k in range(n_targets + 1):
        t = k / n_targets
        i = min(range(len(pts)), key=lambda j: abs(arcs[j] / total - t))
        env = min(1.0, 5.0 * t) * min(1.0, 5.0 * (1.0 - t))
        off = amp * env * (
            math.sin(t * 8.3 + ph) * 0.62
            + math.sin(t * 3.1 + ph * 1.7) * 0.38
        )
        nx, ny = -tans[i][1], tans[i][0]
        out.append((pts[i][0] + nx * off, pts[i][1] + ny * off))
    out[0] = tuple(chain[0])
    out[-1] = tuple(chain[-1])
    return out


def chain_length(chain):
    return arclens(sample_chain(chain, n_per_seg=8))[-1]


def build_roots():
    out = ['          <g class="life-tree__roots" aria-hidden="true">']
    for idx, (chain, width, tier, delay) in enumerate(ROOTS):
        woven = undulate(chain, amp=4.5, seed=idx + 2)
        span = clamp(chain_length(woven) / ROOT_SPEED[tier], SPAN_MIN, SPAN_MAX)
        out.append(
            f'            <path class="life-tree__root life-tree__root--{tier}" '
            f'd="{cr_to_cubic_d(woven)}" pathLength="1" stroke-width="{width}" '
            f'style="--root-delay:{delay};--root-span:{span:.2f}"/>'
        )
    out.append('          </g>')
    return "\n".join(out)


def build_tree():
    out = []

    # ── wood: trunk ──
    out.append('          <g class="life-tree__wood" aria-hidden="true">')
    out.append(f'            <path class="life-tree__wood-shape" d="{tapered_shape(TRUNK_CHAIN, 52, 20, seed=1, taper_pow=0.92, buttress=46, wob=1.0, collars=[(0.52, 6), (0.63, 5), (0.74, 5)])}"/>')
    out.append('          </g>')

    # ── bark ──
    out.append('            <g class="life-tree__bark" aria-hidden="true">')
    for d, w in BARK_DARK:
        out.append(f'              <path d="{d}" stroke-width="{w}"/>')
    out.append('            </g>')
    out.append('            <g class="life-tree__bark life-tree__bark--light" aria-hidden="true">')
    for d, w in BARK_LIGHT:
        out.append(f'              <path d="{d}" stroke-width="{w}"/>')
    out.append('            </g>')

    out.append('          <g class="life-tree__breeze">')

    # ── canopy masses ──
    out.append('            <g class="life-tree__canopy-mass" aria-hidden="true">')
    for cx, cy, R, sd in MASSES:
        out.append(f'              <path class="life-tree__canopy-shape" d="{cloud(cx, cy, R, seed=sd)}"/>')
    for cx, cy, R, sd in MASSES:
        u = cloud(cx + 5, cy + 9, R * 0.93, seed=sd + 0.5)
        out.append(f'              <path class="life-tree__canopy-shape life-tree__canopy-shape--under" d="{u}"/>')
    out.append('            </g>')

    # ── limbs ──
    out.append('            <g class="life-tree__limbs" aria-hidden="true">')
    for name, chain, w0, w1, sd, prim in LIMBS:
        cls = "life-tree__limb life-tree__limb--primary" if prim else "life-tree__limb"
        out.append(f'              <path class="{cls}" data-limb="{name}" d="{tapered_shape(chain, w0, w1, seed=sd)}"/>')
    for chain, w0, w1, sd in SECONDARIES:
        out.append(f'              <path class="life-tree__limb" d="{tapered_shape(chain, w0, w1, seed=sd)}"/>')
    out.append('            </g>')

    # ── foliage: twigs + leaf clusters pinned to mass rims ──
    out.append('            <g class="life-tree__foliage" aria-hidden="true">')
    for chain, w0, w1, sd in TWIGS:
        out.append(f'            <path class="life-tree__twig" d="{tapered_shape(chain, w0, w1, seed=sd, wob=0.4)}"/>')

    rng_state = [42]
    def rnd():
        rng_state[0] = (rng_state[0] * 1103515245 + 12345) % (2**31)
        return rng_state[0] / (2**31)

    for ci, (cx, cy, R, sd) in enumerate(MASSES):
        n_clusters = 4 if R < 70 else 5
        for k in range(n_clusters):
            base_ang = (k / n_clusters) * 2 * math.pi + rnd() * 1.2
            ang = base_ang
            ex = cx + math.cos(ang) * R * 0.94
            ey = cy + math.sin(ang) * R * 0.94 * 0.92
            n_leaves = 4 + int(rnd() * 3)
            leaves = []
            gx, gy = 0.0, 0.0
            for j in range(n_leaves):
                lx = ex + (rnd() - 0.5) * 26
                ly = ey + (rnd() - 0.5) * 22
                gx += lx; gy += ly
                w = 3.4 + rnd() * 3.2
                H = w * (4.1 + rnd() * 0.9)
                rot = (math.degrees(ang) + 180 + (rnd() - 0.5) * 90) % 360
                sc = 0.72 + rnd() * 0.58
                shade = rnd() < 0.32
                leaves.append(leaf(w, H, lx, ly, rot, sc, shade))
            out.append(cluster(leaves, gx / n_leaves, gy / n_leaves))
    out.append('            </g>')  # /foliage
    out.append('          </g>')    # /breeze

    # ── invisible hit paths retraced over the new primaries ──
    out.append('          <g class="life-tree__hit-branches">')
    labels = {"work": "Work", "make": "Make", "serve": "Serve", "learn": "Learn", "east": None}
    hit_map = [
        ("work",  LIMBS[0][1]),
        ("make",  LIMBS[1][1]),
        ("serve", LIMBS[2][1]),
        ("learn", LIMBS[3][1]),
        ("life",  LIMBS[5][1]),
    ]
    for name, chain in hit_map:
        pts = sample_chain(chain, n_per_seg=8)
        d = "M " + " L ".join(f"{fmt(x)} {fmt(y)}" for x, y in pts)
        out.append(f'            <path class="life-tree__branch-hit" data-tree-branch="{name}" d="{d}" tabindex="0" role="link" aria-label="Open {labels.get(name, name)} dossier"/>')
    out.append('          </g>')

    return "\n".join(out)


def splice_region(text, name, fragment):
    """Replace one marker region with fragment, failing loudly on drift."""
    region_re = REGION_RES[name]
    matches = list(region_re.finditer(text))
    if len(matches) != 1:
        raise ValueError(
            f"expected exactly one <!-- gen_tree:{name} --> region in "
            f"{INDEX.relative_to(ROOT)}, found {len(matches)}"
        )
    match = matches[0]
    indent = match.group("indent")
    replacement = (
        f"{indent}<!-- gen_tree:{name} -->\n"
        f"{fragment.strip(chr(10))}\n"
        f"{indent}<!-- /gen_tree:{name} -->"
    )
    return region_re.sub(lambda _m: replacement, text, count=1)


def main():
    parser = argparse.ArgumentParser(
        description="Splice generated tree + root fragments into docs/index.md"
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="verify docs/index.md matches the generator; exit 1 on drift",
    )
    parser.add_argument(
        "--fragments",
        type=Path,
        default=None,
        help="also write raw fragments to this directory",
    )
    args = parser.parse_args()

    roots = build_roots()
    tree = build_tree()

    if args.fragments:
        args.fragments.mkdir(parents=True, exist_ok=True)
        (args.fragments / "roots_fragment.html").write_text(roots + "\n", encoding="utf-8")
        (args.fragments / "tree_fragment.html").write_text(tree + "\n", encoding="utf-8")

    source = INDEX.read_text(encoding="utf-8")
    try:
        patched = splice_region(source, "roots", roots)
        patched = splice_region(patched, "tree", tree)
    except ValueError as exc:
        raise SystemExit(f"gen_tree: {exc}")

    if args.check:
        if patched == source:
            print("gen_tree: docs/index.md matches the generator")
            return
        raise SystemExit(
            "gen_tree: docs/index.md drifted from the generator; "
            "run 'uv run python scripts/python/tree-gen/gen_tree.py' to resync"
        )

    INDEX.write_text(patched, encoding="utf-8")
    print("gen_tree: spliced roots + tree fragments into docs/index.md")


if __name__ == "__main__":
    main()
