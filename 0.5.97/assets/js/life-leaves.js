/*
 * Life leaves -- ambient falling leaves for the landing page.
 *
 * Creates three fixed depth tiers (far / mid / near) inside [data-life-index]
 * and fills each with deterministic leaves. All motion is CSS keyframes (see
 * life-leaves.css); this module only decides spawn configuration and pauses
 * the tiers while the tab is hidden. No-op off the landing page.
 */
(() => {
    "use strict";

    const ROOT_SELECTOR = "[data-life-index]";
    const BLADE_PATH =
        "M0 0 C 4.3 -3.2, 4.3 -15.1, 0 -21.6 C -4.3 -15.1, -4.3 -3.2, 0 0 Z";
    const SVG_NS = "http://www.w3.org/2000/svg";

    /* Palette weights: mostly moss, some deep moss, occasional copper fruit. */
    const LEAF_COLORS = [
        { value: "var(--life-moss)", weight: 0.55 },
        { value: "var(--life-moss-deep)", weight: 0.25 },
        { value: "var(--life-copper)", weight: 0.2 },
    ];

    /*
     * Perspective tiers: near leaves fall faster, larger, and drift wider;
     * far leaves are small, slow, and faint. Counts drop on narrow screens.
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

        // Negative delay spreads leaves through their whole fall on first
        // paint, so the scene opens already alive instead of raining in.
        const delay = -between(random, 0, tier.fallDur[1]);
        leaf.style.setProperty("--delay", `${delay.toFixed(2)}s`);

        const blade = document.createElementNS(SVG_NS, "svg");
        blade.setAttribute("class", "life-leaf__blade");
        blade.setAttribute("viewBox", "-6 -24 12 26");
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
            `${between(random, tier.tumbleDur[0], tier.tumbleDur[1]).toFixed(2)}s`
        );
        blade.style.setProperty(
            "--rot-a",
            `${between(random, -70, -10).toFixed(1)}deg`
        );
        blade.style.setProperty(
            "--rot-b",
            `${between(random, 15, 80).toFixed(1)}deg`
        );

        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", BLADE_PATH);

        blade.appendChild(path);
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
        const random = seededRandom(hashString(`life-leaves-${tier.name}-v1`));

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
