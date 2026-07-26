(function () {
    "use strict";

    var INDEX_SELECTOR = "[data-life-index]";
    var DESKTOP_QUERY = "(min-width: 56.01rem)";
    var FACETS = ["work", "make", "serve", "learn", "life"];
    var INTRO_END = 0.14;
    var PANEL_START = 0.12;
    var teardownCurrentIndex = null;

    function clamp(value, minimum, maximum) {
        return Math.min(Math.max(value, minimum), maximum);
    }

    function easeOutCubic(value) {
        return 1 - Math.pow(1 - value, 3);
    }

    function easeInOutCubic(value) {
        return value < 0.5
            ? 4 * value * value * value
            : 1 - Math.pow(-2 * value + 2, 3) / 2;
    }

    function isKnownFacet(value) {
        return FACETS.indexOf(value) !== -1;
    }

    function facetFromHash() {
        var value = window.location.hash.replace(/^#/, "");
        return isKnownFacet(value) ? value : null;
    }

    function facetFromProgress(progress) {
        var fp = clamp((progress - INTRO_END) / (1 - INTRO_END), 0, 1);
        var index = Math.min(FACETS.length - 1, Math.floor(fp * FACETS.length));
        return FACETS[index];
    }

    function initLivingIndex() {
        if (teardownCurrentIndex) {
            teardownCurrentIndex();
            teardownCurrentIndex = null;
        }

        var root = document.querySelector(INDEX_SELECTOR);
        if (!root) return;

        var journey = root.querySelector("[data-life-journey]");
        var stage = root.querySelector(".life-stage");
        var controls = Array.prototype.slice.call(root.querySelectorAll("[data-life-target]"));
        var panels = Array.prototype.slice.call(root.querySelectorAll("[data-life-panel]"));
        var desktopLayout = window.matchMedia(DESKTOP_QUERY);
        var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        var committedFacet = facetFromHash() || "work";
        var activeFacet = committedFacet;
        var frameRequested = false;
        var journeyStart = 0;
        var journeyRange = 1;
        var disposers = [];

        root.classList.add("is-enhanced");
        root.classList.toggle("is-reduced", reducedMotion.matches);

        function listen(target, eventName, handler, options) {
            target.addEventListener(eventName, handler, options);
            disposers.push(function () {
                target.removeEventListener(eventName, handler, options);
            });
        }

        function selectFacet(nextFacet) {
            if (!isKnownFacet(nextFacet)) return;
            activeFacet = nextFacet;
            root.setAttribute("data-active-facet", nextFacet);

            controls.forEach(function (control) {
                var selected = control.getAttribute("data-life-target") === nextFacet;
                control.classList.toggle("is-active", selected);
                control.setAttribute("aria-selected", selected ? "true" : "false");
                control.setAttribute("tabindex", selected ? "0" : "-1");
            });

            panels.forEach(function (panel) {
                var selected = panel.getAttribute("data-life-panel") === nextFacet;
                panel.classList.toggle("is-active", selected);
                panel.setAttribute("aria-hidden", selected ? "false" : "true");
            });
        }

        function commitFacet(nextFacet) {
            if (!isKnownFacet(nextFacet)) return;
            selectFacet(nextFacet);
            committedFacet = nextFacet;
            if (window.location.hash !== "#" + nextFacet) {
                window.history.pushState({ lifeFacet: nextFacet }, "", "#" + nextFacet);
            }
        }

        function measureJourney() {
            var documentTop = journey.getBoundingClientRect().top + window.scrollY;
            journeyStart = documentTop;
            journeyRange = Math.max(journey.offsetHeight - stage.offsetHeight, 1);
        }

        function scrollToFacet(facet) {
            var index = FACETS.indexOf(facet);
            if (index === -1) return;
            var fp = (index + 0.5) / FACETS.length;
            var progress = INTRO_END + fp * (1 - INTRO_END);
            var target = journeyStart + journeyRange * progress;
            window.scrollTo({
                top: target,
                behavior: reducedMotion.matches ? "auto" : "smooth"
            });
        }

        function applyProgress(rawProgress) {
            var progress = clamp(rawProgress, 0, 1);
            // Sequenced handoff: the intro bows out first (0.08-0.20), the
            // tree decamps to the left (0.10-0.38), then the dossier lands
            // (0.16-0.32) -- each gesture gets its own window so the opening
            // never collapses into one muddled crossfade.
            var introOpacity = 1 - clamp((progress - 0.08) / 0.12, 0, 1);
            var panelOpacity = clamp((progress - 0.16) / 0.16, 0, 1);
            var detail = 1 - (clamp((progress - 0.06) / 0.5, 0, 1) * 0.84);
            var pixelOpacity = clamp((progress - 0.14) / 0.34, 0, 0.9);

            var treeEased = easeInOutCubic(clamp((progress - 0.1) / 0.28, 0, 1));

            root.style.setProperty("--life-tree-x", (-31 * treeEased).toFixed(3) + "vw");
            root.style.setProperty("--life-tree-scale", (1 - (0.5 * treeEased)).toFixed(3));
            root.style.setProperty("--life-intro-opacity", introOpacity.toFixed(3));
            root.style.setProperty("--life-panel-opacity", panelOpacity.toFixed(3));
            root.style.setProperty("--life-panel-y", ((1 - panelOpacity) * 1.5).toFixed(3) + "rem");
            root.style.setProperty("--life-tree-detail", detail.toFixed(3));
            root.style.setProperty("--life-pixel-opacity", pixelOpacity.toFixed(3));
            root.style.setProperty("--life-meter", (progress * 100).toFixed(1) + "%");
            root.classList.toggle("is-indexed", progress > 0.08);
            root.classList.toggle("is-open", progress > PANEL_START);

            if (desktopLayout.matches && !reducedMotion.matches) {
                var nextFacet = facetFromProgress(progress);
                if (nextFacet !== activeFacet) {
                    selectFacet(nextFacet);
                }
            }
        }

        function updateScrollState() {
            frameRequested = false;

            if (!desktopLayout.matches) {
                root.classList.add("is-open");
                root.classList.remove("is-indexed");
                return;
            }

            if (reducedMotion.matches) {
                applyProgress(1);
                selectFacet(committedFacet);
                return;
            }

            applyProgress((window.scrollY - journeyStart) / journeyRange);
        }

        function requestScrollUpdate() {
            if (frameRequested) return;
            frameRequested = true;
            window.requestAnimationFrame(updateScrollState);
        }

        function handleControlClick(event) {
            var control = event.currentTarget;
            var nextFacet = control.getAttribute("data-life-target");
            event.preventDefault();
            commitFacet(nextFacet);
            scrollToFacet(nextFacet);
        }

        function handleControlKeydown(event) {
            var currentIndex = FACETS.indexOf(activeFacet);
            var nextIndex = null;

            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                nextIndex = (currentIndex + 1) % FACETS.length;
            } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                nextIndex = (currentIndex - 1 + FACETS.length) % FACETS.length;
            } else if (event.key === "Home") {
                nextIndex = 0;
            } else if (event.key === "End") {
                nextIndex = FACETS.length - 1;
            }

            if (nextIndex === null) return;
            event.preventDefault();
            var nextFacet = FACETS[nextIndex];
            commitFacet(nextFacet);
            scrollToFacet(nextFacet);
        }

        function handleHistoryChange() {
            var hashFacet = facetFromHash();
            if (!hashFacet) return;
            committedFacet = hashFacet;
            selectFacet(hashFacet);
            if (desktopLayout.matches && !reducedMotion.matches) {
                scrollToFacet(hashFacet);
            }
        }

        function handleLayoutChange() {
            root.classList.toggle("is-reduced", reducedMotion.matches);
            measureJourney();
            requestScrollUpdate();
        }

        controls.forEach(function (control) {
            listen(control, "click", handleControlClick);
            listen(control, "keydown", handleControlKeydown);
        });

        listen(window, "scroll", requestScrollUpdate, { passive: true });
        listen(window, "resize", handleLayoutChange, { passive: true });
        listen(window, "hashchange", handleHistoryChange);
        listen(window, "popstate", handleHistoryChange);
        listen(desktopLayout, "change", handleLayoutChange);
        listen(reducedMotion, "change", handleLayoutChange);

        selectFacet(committedFacet);
        measureJourney();
        updateScrollState();

        if (facetFromHash() && desktopLayout.matches && !reducedMotion.matches) {
            window.requestAnimationFrame(function () {
                scrollToFacet(facetFromHash());
            });
        }

        teardownCurrentIndex = function () {
            disposers.forEach(function (dispose) { dispose(); });
            root.classList.remove("is-enhanced", "is-indexed", "is-open", "is-reduced");
        };
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initLivingIndex, { once: true });
    } else {
        initLivingIndex();
    }

    if (typeof document$ !== "undefined") {
        document$.subscribe(initLivingIndex);
    }
})();
