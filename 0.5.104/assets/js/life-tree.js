(() => {
    "use strict";

    const ROOT_SELECTOR = "[data-life-index]";

    // --- deterministic per-element wind, seeded from a stable string ---
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

    function setDegrees(element, property, value) {
        element.style.setProperty(property, `${value.toFixed(2)}deg`);
    }

    function configureMotion(tree) {
        const clusters = [...tree.querySelectorAll(".life-tree__cluster")];

        clusters.forEach((cluster, index) => {
            const random = seededRandom(
                hashString(`life-tree-cluster-${index}`)
            );

            const positive = between(random, 0.55, 2.25);
            const negative = -between(random, 0.4, 1.7);

            setDegrees(cluster, "--flutter-positive", positive);
            setDegrees(cluster, "--flutter-negative", negative);
            setDegrees(cluster, "--flutter-settle", positive * 0.24);

            cluster.style.setProperty(
                "--flutter-duration",
                `${between(random, 3.2, 6.8).toFixed(2)}s`
            );
            cluster.style.setProperty(
                "--flutter-delay",
                `${-between(random, 0, 6).toFixed(2)}s`
            );
        });
    }

    /*
     * Highlight the active branch + node. living-index.js owns facet selection,
     * keyboard nav, the URL hash, the scroll choreography, and the reduced-
     * motion class. We only watch its data-active-facet attribute and reflect
     * it onto the SVG, so the two controllers never fight.
     *
     * The visible wood is one continuous silhouette and never recolors; active
     * state is expressed on the semantic hit paths and their nodes.
     */
    function reflectActiveFacet(root, tree) {
        const branches = [...tree.querySelectorAll(".life-tree__branch-hit[data-tree-branch]")];
        const nodes = [...tree.querySelectorAll("[data-tree-node]")];

        const apply = (facet) => {
            branches.forEach((branch) => {
                branch.classList.toggle(
                    "is-active",
                    branch.dataset.treeBranch === facet
                );
            });
            nodes.forEach((node) => {
                node.classList.toggle(
                    "is-active",
                    node.dataset.treeNode === facet
                );
            });
        };

        const observer = new MutationObserver(() => {
            apply(root.getAttribute("data-active-facet"));
        });

        observer.observe(root, {
            attributes: true,
            attributeFilter: ["data-active-facet"],
        });

        apply(root.getAttribute("data-active-facet"));
    }

    function initializeLifeIndex(root) {
        if (root.dataset.lifeTreeReady === "true") {
            return;
        }

        const tree = root.querySelector("[data-life-tree-svg]")
            || root.querySelector(".life-tree");
        const tabs = [...root.querySelectorAll("[data-life-target]")];

        if (!tree || tabs.length === 0) {
            return;
        }

        root.dataset.lifeTreeReady = "true";

        const validFacets = new Set(
            tabs.map((tab) => tab.dataset.lifeTarget).filter(Boolean)
        );

        configureMotion(tree);
        reflectActiveFacet(root, tree);

        const selectFromTree = (facet) => {
            if (!validFacets.has(facet)) {
                return;
            }
            // Drive the existing controller through the URL hash it already
            // listens to; this keeps a single source of truth for facet state.
            if (window.location.hash.slice(1) === facet) {
                window.dispatchEvent(new HashChangeEvent("hashchange"));
            } else {
                window.location.hash = facet;
            }
        };

        const branchNodes = tree.querySelectorAll("[data-tree-node]");
        const nodeFor = (facet) =>
            [...branchNodes].find((node) => node.dataset.treeNode === facet);
        const previewFacet = (facet, visible) => {
            nodeFor(facet)?.classList.toggle("is-preview", visible);
        };

        tree.querySelectorAll(".life-tree__branch-hit[data-tree-branch]").forEach((branch) => {
            const facet = branch.dataset.treeBranch;
            branch.addEventListener("click", () => {
                selectFromTree(facet);
            });
            branch.addEventListener("pointerenter", () => {
                previewFacet(facet, true);
            });
            branch.addEventListener("pointerleave", () => {
                previewFacet(facet, false);
            });
            branch.addEventListener("focus", () => {
                previewFacet(facet, true);
            });
            branch.addEventListener("blur", () => {
                previewFacet(facet, false);
            });
            branch.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " ") {
                    return;
                }
                event.preventDefault();
                selectFromTree(facet);
            });
        });

        branchNodes.forEach((node) => {
            node.addEventListener("click", (event) => {
                event.stopPropagation();
                selectFromTree(node.dataset.treeNode);
            });
        });

        /*
         * Pause the animation when the tree leaves the viewport so a long page
         * visit does not keep animating SVG forever.
         */
        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    tree.classList.toggle("is-wind-on", entry.isIntersecting);
                },
                { rootMargin: "15% 0px", threshold: 0.04 }
            );

            observer.observe(tree);
        } else {
            tree.classList.add("is-wind-on");
        }
    }

    function boot() {
        document
            .querySelectorAll(ROOT_SELECTOR)
            .forEach(initializeLifeIndex);
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
