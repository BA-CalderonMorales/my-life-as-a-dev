(() => {
    "use strict";

    const ROOT_SELECTOR = "[data-life-index]";

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
        const treeShell = tree.closest("[data-life-tree]") || tree;

        const validFacets = new Set(
            tabs.map((tab) => tab.dataset.lifeTarget).filter(Boolean)
        );

        reflectActiveFacet(root, tree);

        const pauseWind = () => tree.classList.add("is-wind-paused");
        const resumeWind = () => tree.classList.remove("is-wind-paused");

        // A navigation target should never move under a pointer or keyboard
        // user. Freeze the crown at its current frame for interaction, then
        // resume from that exact frame when the user leaves the tree.
        treeShell.addEventListener("pointerenter", pauseWind);
        treeShell.addEventListener("pointerleave", resumeWind);
        treeShell.addEventListener("focusin", pauseWind);
        treeShell.addEventListener("focusout", (event) => {
            if (!treeShell.contains(event.relatedTarget)) {
                resumeWind();
            }
        });

        const selectFromTree = (facet) => {
            if (!validFacets.has(facet)) {
                return;
            }
            // Activate the existing tab control instead of racing the page
            // framework through a raw hash change. The living-index controller
            // remains the single owner of selection, history, and scroll state.
            tabs.find((tab) => tab.dataset.lifeTarget === facet)?.click();
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
