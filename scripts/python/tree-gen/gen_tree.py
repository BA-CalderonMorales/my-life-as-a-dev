#!/usr/bin/env python3
"""Regenerate the living-index tree as hand-drawn tapered pencil shapes.

v3 - organ pass:
  - trunk with real mass: strong taper, asymmetric buttress lobes,
    branch collars at limb junctions, livelier edge wobble,
  - roots as tapered organs: continuous taper from flare to hair-thin
    tip, junction collars at forks, elbow kinks, flares starting inside
    the trunk outline so the system reads grown from the wood itself;
    draw-on is a masked reveal per tier (no more extruded wires),
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


def taper_outline(pts, w0, w1, seed=1, taper_pow=0.85, buttress=0.0,
                  wob=0.7, tip_sharp=True, collars=()):
    """Emit a closed tapered filled path around a sampled centerline."""
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


def tapered_shape(chain, w0, w1, seed=1, taper_pow=0.85, buttress=0.0,
                  wob=0.7, tip_sharp=True, collars=()):
    """Emit a closed tapered filled path around a chained centerline."""
    return taper_outline(
        sample_chain(chain), w0, w1, seed=seed, taper_pow=taper_pow,
        buttress=buttress, wob=wob, tip_sharp=tip_sharp, collars=collars,
    )


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

# ── roots: tapered organs grown from the trunk flare ─────────────────────
# Every root is an ORGAN, not a stroke: a filled shape with continuous
# taper (buttress-wide at the flare, hair-thin at the tip), edge wobble,
# junction collars where children fork off, and elbow kinks where the
# root struck a stone. The draw-on is a masked reveal: each tier group
# carries mask="url(#life-roots-mask-{tier})" whose white centerline
# strokes keep the --root-delay/--root-span windows and consume the same
# CSS spring scalars the old strokes did. No-JS / reduced-motion see the
# full static system because those states resolve every window to 1.
#
# Spec fields:
#   name      stable id; children reference it as parent
#   chain     authored waypoints (may embed deliberate elbow corners)
#   flare/tip widths at the flare and near the tip (taper ratio contract)
#   tier      primary | lateral | fine  (markup + reveal grouping)
#   delay     reveal start on the tier's 0..1 growth scalar
#   seed      deterministic wobble phase
#   parent    name of the root this one forks from (None = trunk flare)
#   kinks     (arc_fraction, degrees) tail bends applied before weaving
#   amp       undulation amplitude for this spine
class RootSpec:
    def __init__(self, name, chain, flare, tip, tier, delay, seed,
                 parent=None, kinks=(), amp=4.5):
        self.name = name
        self.chain = chain
        self.flare = flare
        self.tip = tip
        self.tier = tier
        self.delay = delay
        self.seed = seed
        self.parent = parent
        self.kinks = list(kinks)
        self.amp = amp


ROOT_SPECS = [
    # primaries: the buttress continuations, one elbow each where the
    # root struck stone; flares sit INSIDE the trunk outline so the eye
    # never has to take the seam on faith.
    RootSpec(
        "west-dive",
        [(340, 700), (322, 731), (308, 769), (301, 790), (295, 797),
         (290, 812), (288, 846), (288, 872)],
        flare=22.0, tip=2.0, tier="primary", delay=0.00, seed=2,
        kinks=[(0.55, 16.0)], amp=4.0,
    ),
    RootSpec(
        "east-dive",
        [(382, 702), (400, 733), (414, 765), (421, 786), (427, 793),
         (432, 809), (436, 848), (442, 884)],
        flare=20.0, tip=1.9, tier="primary", delay=0.03, seed=3,
        kinks=[(0.52, -14.0)], amp=4.2,
    ),
    RootSpec(
        "west-runner",
        [(332, 706), (306, 724), (282, 741), (264, 750), (256, 752),
         (247, 759), (231, 771), (211, 789), (200, 801), (196, 814),
         (194, 843), (192, 872)],
        flare=17.0, tip=1.8, tier="primary", delay=0.06, seed=4,
        kinks=[(0.38, 13.0), (0.74, -11.0)], amp=4.5,
    ),
    RootSpec(
        "east-runner",
        [(390, 706), (412, 720), (436, 734), (456, 744), (464, 747),
         (473, 755), (491, 767), (509, 780), (520, 791), (526, 803),
         (530, 818)],
        flare=15.0, tip=1.7, tier="primary", delay=0.09, seed=5,
        kinks=[(0.42, -12.0), (0.70, 10.0)], amp=4.4,
    ),
    RootSpec(
        "center-sinker",
        [(360, 710), (357, 756), (362, 806), (372, 862), (380, 910)],
        flare=24.0, tip=2.1, tier="primary", delay=0.12, seed=6,
        kinks=[(0.60, 9.0)], amp=3.4,
    ),
    # laterals: fork downward off a parent, each leaving tangentially;
    # the generator derives fork anchors from the FINAL parent polyline,
    # adds a collar swelling on the parent at every interior fork.
    RootSpec("west-dive-outer", [(288, 872), (270, 908), (250, 954)],
             flare=5.6, tip=0.65, tier="lateral", delay=0.22, seed=8,
             parent="west-dive"),
    RootSpec("west-dive-inner", [(288, 872), (301, 914), (307, 958)],
             flare=4.4, tip=0.5, tier="lateral", delay=0.26, seed=9,
             parent="west-dive"),
    RootSpec("east-dive-outer", [(442, 884), (459, 922), (473, 966)],
             flare=6.0, tip=0.7, tier="lateral", delay=0.25, seed=10,
             parent="east-dive"),
    RootSpec("east-dive-inner", [(442, 884), (431, 924), (423, 960)],
             flare=4.6, tip=0.5, tier="lateral", delay=0.29, seed=11,
             parent="east-dive"),
    RootSpec("west-runner-drop", [(200, 830), (183, 868), (171, 908)],
             flare=5.0, tip=0.55, tier="lateral", delay=0.28, seed=12,
             parent="west-runner"),
    RootSpec("east-runner-drop", [(530, 818), (549, 854), (563, 894)],
             flare=4.8, tip=0.55, tier="lateral", delay=0.31, seed=13,
             parent="east-runner"),
    RootSpec("sinker-sweep", [(372, 862), (356, 906), (338, 950), (329, 988)],
             flare=5.4, tip=0.6, tier="lateral", delay=0.34, seed=14,
             parent="center-sinker"),
    RootSpec("sinker-probe", [(380, 910), (392, 947), (401, 980)],
             flare=4.0, tip=0.45, tier="lateral", delay=0.37, seed=15,
             parent="center-sinker"),
    # fine feeders: sparse hair organs, visibly subordinate
    RootSpec("hair-west-a", [(305, 772), (290, 800), (281, 836)],
             flare=3.0, tip=0.35, tier="fine", delay=0.30, seed=16,
             parent="west-dive"),
    RootSpec("hair-east-a", [(420, 780), (436, 810), (449, 843)],
             flare=3.0, tip=0.35, tier="fine", delay=0.32, seed=17,
             parent="east-dive"),
    RootSpec("hair-west-b", [(240, 770), (226, 801), (217, 834)],
             flare=2.6, tip=0.3, tier="fine", delay=0.36, seed=18,
             parent="west-runner"),
    RootSpec("hair-east-b", [(464, 750), (478, 781), (491, 813)],
             flare=2.6, tip=0.3, tier="fine", delay=0.38, seed=19,
             parent="east-runner"),
    RootSpec("hair-west-c", [(296, 820), (283, 851), (276, 884)],
             flare=2.4, tip=0.28, tier="fine", delay=0.40, seed=20,
             parent="west-dive"),
    RootSpec("hair-center", [(362, 806), (347, 838), (337, 872)],
             flare=2.2, tip=0.25, tier="fine", delay=0.42, seed=21,
             parent="center-sinker"),
    RootSpec("hair-east-c", [(432, 832), (420, 861), (414, 888)],
             flare=2.2, tip=0.25, tier="fine", delay=0.44, seed=22,
             parent="east-dive"),
]

# Draw speed per tier, in viewBox units consumed per unit of reveal
# progress: thick wood crawls with slow authority while fine feeders
# flick out quickly. A root's --root-span derives from its own length
# divided by its tier speed, so long strokes never streak.
ROOT_SPEED = {"primary": 620.0, "lateral": 470.0, "fine": 430.0}
SPAN_MIN, SPAN_MAX = 0.12, 0.34

# Forks strictly inside this arc window get a collar on the parent;
# forks AT a tip are carried by the children's own flares instead.
COLLAR_WINDOW = (0.05, 0.95)


def undulate(chain, amp=4.5, seed=1):
    """Weave a coarse spine into an organic centerline, endpoints pinned.

    Low-frequency perpendicular offsets fade to zero at both ends; the
    seed gives every root its own phase, so mirrored placements never
    render as matching curves. Fork attachment is handled separately by
    snapping children onto their parent's final polyline.
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


def _bend_tail(waypoints, t_kink, turn_deg):
    """Rotate the tail of a waypoint chain around the waypoint nearest
    arc fraction t_kink: one elbow where the root struck an obstacle."""
    wp = [tuple(p) for p in waypoints]
    lens = [0.0]
    for i in range(1, len(wp)):
        lens.append(lens[-1] + math.hypot(wp[i][0] - wp[i-1][0],
                                          wp[i][1] - wp[i-1][1]))
    total = lens[-1] or 1.0
    pivot = min(range(len(wp)), key=lambda i: abs(lens[i] / total - t_kink))
    pivot = max(1, min(len(wp) - 2, pivot))
    rad = math.radians(turn_deg)
    cos, sin = math.cos(rad), math.sin(rad)
    px, py = wp[pivot]
    out = wp[:pivot + 1]
    for x, y in wp[pivot + 1:]:
        dx, dy = x - px, y - py
        out.append((px + dx * cos - dy * sin, py + dx * sin + dy * cos))
    return out


def _point_at_index(pts, arcs, target):
    idx = min(range(len(pts)), key=lambda i: abs(arcs[i] - target))
    return idx


class RootRecord:
    """Final geometry of one root organ plus what its forks owe it."""

    def __init__(self, spec):
        self.spec = spec
        self.pts = []
        self.arcs = []
        self.tans = []
        self.total = 0.0
        self.collars = []
        self.waypoints = []

    @property
    def span(self):
        length = self.arcs[-1] if self.arcs else 1.0
        return clamp(length / ROOT_SPEED[self.spec.tier], SPAN_MIN, SPAN_MAX)

    def point_at(self, t):
        idx = _point_at_index(self.pts, self.arcs, self.total * t)
        return self.pts[idx], self.tans[idx], self.arcs[idx] / self.total


def build_root_records():
    """Weave, bend, and attach every root spec into final geometry.

    Parents are processed before children (spec order guarantees it);
    each child snaps onto its parent's FINAL polyline, so forks stay
    attached no matter how the parent wove or bent.
    """
    records = {}
    for spec in ROOT_SPECS:
        woven = undulate(spec.chain, amp=spec.amp, seed=spec.seed)
        for t_kink, deg in spec.kinks:
            woven = _bend_tail(woven, t_kink, deg)
        pts = sample_chain(woven)
        arcs = arclens(pts)
        rec = RootRecord(spec)
        rec.pts = pts
        rec.arcs = arcs
        rec.total = arcs[-1]
        rec.tans = tangents(pts)
        rec.waypoints = [tuple(p) for p in woven]

        if spec.parent is not None:
            parent = records[spec.parent]
            anchor = tuple(spec.chain[0])
            idx = min(
                range(len(parent.pts)),
                key=lambda i: math.hypot(parent.pts[i][0] - anchor[0],
                                         parent.pts[i][1] - anchor[1]),
            )
            px, py = parent.pts[idx]
            tx, ty = parent.tans[idx]
            fork_t = parent.arcs[idx] / parent.total
            # Slide the whole child so its flare sits ON the parent.
            dx, dy = px - woven[0][0], py - woven[0][1]
            woven = [(x + dx, y + dy) for x, y in woven]
            # Children leave tangentially: blend the first segment's
            # direction toward the parent's flow, never a perpendicular T.
            sx, sy = woven[1]
            vx, vy = sx - px, sy - py
            seg = math.hypot(vx, vy) or 1.0
            along = vx * tx + vy * ty
            flow = 1.0 if along >= 0 else -1.0
            mx = flow * tx * 0.7 + vx / seg * 0.45
            my = flow * ty * 0.7 + vy / seg * 0.45
            norm = math.hypot(mx, my) or 1.0
            woven[1] = (px + mx / norm * seg, py + my / norm * seg)
            pts = sample_chain(woven)
            rec.pts = pts
            rec.arcs = arclens(pts)
            rec.total = rec.arcs[-1]
            rec.tans = tangents(pts)
            rec.waypoints = [tuple(p) for p in woven]
            rec.fork_t = fork_t
            if COLLAR_WINDOW[0] <= fork_t <= COLLAR_WINDOW[1]:
                parent.collars.append((fork_t, spec.flare * 0.62))
        else:
            rec.fork_t = None

        records[spec.name] = rec
    return records


def build_roots():
    records = build_root_records()
    tiers = ("primary", "lateral", "fine")

    # Mask region: generous box around every root so no reveal clip ever
    # beheads an organ; computed from real geometry, padded hard.
    xs = [x for r in records.values() for x, _ in r.pts]
    ys = [y for r in records.values() for _, y in r.pts]
    pad = 80
    region = (
        fmt(min(xs) - pad), fmt(min(ys) - pad),
        fmt(max(xs) - min(xs) + 2 * pad), fmt(max(ys) - min(ys) + 2 * pad),
    )

    out = ['          <g class="life-tree__roots" aria-hidden="true">']
    out.append('            <defs>')
    for tier in tiers:
        out.append(
            f'              <mask id="life-roots-mask-{tier}" '
            f'maskUnits="userSpaceOnUse" '
            f'x="{region[0]}" y="{region[1]}" '
            f'width="{region[2]}" height="{region[3]}">'
        )
        for name in [s.name for s in ROOT_SPECS if s.tier == tier]:
            rec = records[name]
            spec = rec.spec
            brush = spec.flare * 1.25 + 2.0
            out.append(
                f'                <path class="life-tree__root life-tree__root--{tier}" '
                f'd="{cr_to_cubic_d(rec.waypoints)}" pathLength="1" '
                f'stroke-width="{fmt(brush)}" '
                f'style="--root-delay:{spec.delay};--root-span:{rec.span:.2f}"/>'
            )
        out.append('              </mask>')
    out.append('            </defs>')
    for tier in tiers:
        out.append(
            f'            <g class="life-tree__root-tier life-tree__root-tier--{tier}" '
            f'mask="url(#life-roots-mask-{tier})">'
        )
        for name in [s.name for s in ROOT_SPECS if s.tier == tier]:
            rec = records[name]
            spec = rec.spec
            d = taper_outline(
                rec.pts, spec.flare, spec.tip, seed=spec.seed,
                taper_pow=0.8, wob=0.7, collars=rec.collars,
            )
            out.append(
                f'              <path class="life-tree__root-body life-tree__root-body--{tier}" d="{d}"/>'
            )
        out.append('            </g>')
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
