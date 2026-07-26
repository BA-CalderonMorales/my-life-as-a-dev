/*
 * Life leaves -- ambient falling petals for the landing page.
 *
 * Creates three fixed depth tiers (far / mid / near) inside [data-life-index]
 * and fills each with deterministic petals. All motion is CSS keyframes (see
 * life-leaves.css); this module only decides spawn configuration and pauses
 * the tiers while the tab is hidden. No-op off the landing page.
 *
 * Petals come in four organic shapes (sakura-notch, curved sweep, lumpy
 * round, elongated willow), each with a midrib so they read as folded
 * petals rather than flat icons. A minority helicopter slowly instead of
 * fluttering.
 */
(() => {
    "use strict";

    const ROOT_SELECTOR = "[data-life-index]";
    const SVG_NS = "http://www.w3.org/2000/svg";
    const SPIN_CHANCE = 0.25;

    /* Organic petal silhouettes in a 24x24 box, each with its curved midrib. */
    const SHAPES = [
        {
            // Sakura petal with the signature tip notch.
            petal:
                "M12 3 L11 5.2 C7 8 4.8 11.5 5.4 15.2 C6 19.2 9 21.6 12 22.2 " +
                "C15 21.6 18 19.2 18.6 15.2 C19.2 11.5 17 8 13 5.2 L12 3 Z",
            rib: "M11.6 5.5 C11.2 10 11.8 15.5 11.4 20.5",
        },
        {
            // Curved sweep, one side fuller than the other.
            petal:
                "M6.5 3.5 C12.5 4 18 8.5 18.8 14.2 C19.3 18.8 15.8 22 11.8 21.4 " +
                "C7.5 20.7 4.6 16.8 5.2 12.2 C5.7 8.4 4.2 5.4 6.5 3.5 Z",
            rib: "M6.8 5 C10 9 13.5 14 15.5 19.5",
        },
        {
            // Lumpy round petal with a wavy edge.
            petal:
                "M12 2.5 C14.8 1.8 17.8 4 18.8 7 C20.5 10 19 13 19.2 16 " +
                "C19.4 19.8 15.5 22.2 12 21.6 C8.5 22.2 4.6 19.8 4.8 16 " +
                "C5 13 3.5 10 5.2 7 C6.2 4 9.2 1.8 12 2.5 Z",
            rib: "M12 4.5 C11.5 9.5 12.5 15 11.8 20",
        },
        {
            // Elongated willow leaf, gently bent off-axis.
            petal:
                "M11.5 1.5 C14 6 17 11 16.4 15.8 C15.9 19.9 13.2 22.4 10.6 21.8 " +
                "C7.9 21.2 6.4 18.2 7.1 14.2 C7.8 10.2 8.8 5.4 11.5 1.5 Z",
            rib: "M11.3 3.5 C10.8 8.5 11.6 14.5 10.8 20",
        },
    ];

    /* Palette weights: mostly moss, some deep moss, occasional copper fruit. */
    const LEAF_COLORS = [
        { value: "var(--life-moss)", weight: 0.55 },
        { value: "var(--life-moss-deep)", weight: 0.25 },
        { value: "var(--life-copper)", weight: 0.2 },
    ];

    /*
     * Perspective tiers: near petals fall faster, larger, and drift wider;
     * far petals are small, slow, and faint. Counts drop on narrow screens.
     */
    const TIERS = [
        {
            name: "far",
            count: { wide: 14, narrow: 8 },
            scale: [0.3, 0.5],
            opacity: [0.22, 0.38],
            fallDur: [26, 38],
            sway: [5, 9],
            swayDur: [5.5, 8],
            tumbleDur: [6.5, 9],
            drift: [-4, 5],
        },
        {
            name: "mid",
            count: { wide: 10, narrow: 6 },
            scale: [0.55, 0.85],
            opacity: [0.38, 0.58],
            fallDur: [16, 24],
            sway: [10, 18],
            swayDur: [4, 6],
            tumbleDur: [4.5, 7],
            drift: [-6, 8],
        },
        {
            name: "near",
            count: { wide: 5, narrow: 3 },
            scale: [1.05, 1.55],
            opacity: [0.5, 0.7],
            fallDur: [9, 14],
            sway: [20, 34],
            swayDur: [3, 4.5],
            tumbleDur: [3.5, 5.5],
            drift: [-9, 11],
        },
    ];

    // --- deterministic spawn, seeded per tier + leaf (same PRNG as life-tree) ---
    function hashString(value) {
        let hash = 2166136261;

        for (let index = 0; index < value.length; index += 1) {
            hash ^= value.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }

        return hash >>> 0;
    }

    function seededRandom(seed) {
        let value = seed >>> 0;

        return () => {
            value += 0x6d2b79f5;

            let result = value;
            result = Math.imul(result ^ (result >>> 15), result | 1);
            result ^= result + Math.imul(result ^ (result >>> 7), result | 61);

            return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
        };
    }

    function between(random, minimum, maximum) {
        return minimum + random() * (maximum - minimum);
    }

    function pickColor(random) {
        let roll = random();

        for (const color of LEAF_COLORS) {
            if (roll < color.weight) {
                return color.value;
            }
            roll -= color.weight;
        }

        return LEAF_COLORS[0].value;
    }

    function createLeaf(random, tier) {
        const leaf = document.createElement("span");
        leaf.className = "life-leaf";
        leaf.style.color = pickColor(random);
        leaf.style.setProperty("--x", `${between(random, -2, 100).toFixed(1)}vw`);
        leaf.style.setProperty(
            "--drift",
            `${between(random, tier.drift[0], tier.drift[1]).toFixed(1)}vw`
        );
        leaf.style.setProperty(
            "--scale",
            between(random, tier.scale[0], tier.scale[1]).toFixed(2)
        );
        leaf.style.setProperty(
            "--leaf-opacity",
            between(random, tier.opacity[0], tier.opacity[1]).toFixed(2)
        );
        leaf.style.setProperty(
            "--fall-dur",
            `${between(random, tier.fallDur[0], tier.fallDur[1]).toFixed(2)}s`
        );

        // Negative delay spreads petals through their whole fall on first
        // paint, so the scene opens already alive instead of raining in.
        const delay = -between(random, 0, tier.fallDur[1]);
        leaf.style.setProperty("--delay", `${delay.toFixed(2)}s`);

        // A minority of petals helicopter slowly instead of fluttering.
        const spinning = random() < SPIN_CHANCE;
        if (spinning) {
            leaf.classList.add("life-leaf--spin");
        }

        const blade = document.createElementNS(SVG_NS, "svg");
        blade.setAttribute("class", "life-leaf__blade");
        blade.setAttribute("viewBox", "0 0 24 24");
        blade.setAttribute("aria-hidden", "true");
        blade.style.setProperty(
            "--sway",
            `${between(random, tier.sway[0], tier.sway[1]).toFixed(1)}px`
        );
        blade.style.setProperty(
            "--sway-dur",
            `${between(random, tier.swayDur[0], tier.swayDur[1]).toFixed(2)}s`
        );
        blade.style.setProperty(
            "--tumble-dur",
            spinning
                ? `${between(random, 7, 11).toFixed(2)}s`
                : `${between(random, tier.tumbleDur[0], tier.tumbleDur[1]).toFixed(2)}s`
        );

        const shape = SHAPES[Math.floor(random() * SHAPES.length)];

        const flutter = document.createElementNS(SVG_NS, "g");
        flutter.setAttribute("class", "life-leaf__flutter");

        const petal = document.createElementNS(SVG_NS, "path");
        petal.setAttribute("class", "life-leaf__petal");
        petal.setAttribute("d", shape.petal);

        const rib = document.createElementNS(SVG_NS, "path");
        rib.setAttribute("class", "life-leaf__rib");
        rib.setAttribute("d", shape.rib);

        flutter.appendChild(petal);
        flutter.appendChild(rib);
        blade.appendChild(flutter);
        leaf.appendChild(blade);

        return leaf;
    }

    // Live tier containers; a single listener freezes all of them while the
    // tab is hidden so a backgrounded page never burns compositor work.
    const activeTiers = [];
    let visibilityWatched = false;

    function watchVisibility() {
        if (visibilityWatched) {
            return;
        }
        visibilityWatched = true;

        document.addEventListener("visibilitychange", () => {
            activeTiers.forEach((tier) =>
                tier.classList.toggle("life-leaves--paused", document.hidden)
            );
        });
    }

    function createTier(tier, wideLayout) {
        const container = document.createElement("div");
        container.className = `life-leaves life-leaves--${tier.name}`;
        container.setAttribute("aria-hidden", "true");

        const count = wideLayout ? tier.count.wide : tier.count.narrow;
        const random = seededRandom(hashString(`life-leaves-${tier.name}-v2`));

        for (let index = 0; index < count; index += 1) {
            container.appendChild(createLeaf(random, tier));
        }

        return container;
    }

    function initializeLeaves(root) {
        if (root.dataset.lifeLeavesReady === "true") {
            return;
        }

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        root.dataset.lifeLeavesReady = "true";

        const wideLayout = window.matchMedia("(min-width: 60rem)").matches;
        const tiers = TIERS.map((tier) => createTier(tier, wideLayout));

        tiers.forEach((tier) => {
            root.appendChild(tier);
            activeTiers.push(tier);
        });

        watchVisibility();
    }

    function boot() {
        document
            .querySelectorAll(ROOT_SELECTOR)
            .forEach(initializeLeaves);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }

    if (window.document$ && typeof window.document$.subscribe === "function") {
        window.document$.subscribe(boot);
    }
})();
