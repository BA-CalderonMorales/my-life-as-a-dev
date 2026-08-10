(function () {
    "use strict";

    var INDEX_SELECTOR = "[data-life-index]";
    var DESKTOP_QUERY = "(min-width: 64.01rem)";
    var FACETS = ["work", "make", "serve", "learn", "life"];
    var INTRO_END = 0.14;
    var PANEL_START = 0.12;
    var teardownCurrentIndex = null;

    function clamp(value, minimum, maximum) {
        return Math.min(Math.max(value, minimum), maximum);
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
        var treeShell = root.querySelector("[data-life-tree]");
        var controls = Array.prototype.slice.call(root.querySelectorAll("[data-life-target]"));
        var panels = Array.prototype.slice.call(root.querySelectorAll("[data-life-panel]"));
        var desktopLayout = window.matchMedia(DESKTOP_QUERY);
        var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        var committedFacet = facetFromHash() || "work";
        var activeFacet = committedFacet;
        var frameRequested = false;
        var alignmentFrame = null;
        var layoutReleaseFrame = null;
        var layoutTransitioning = false;
        var pendingFacet = null;
        var handledHash = window.location.hash;
        var scrollBehaviorFrame = null;
        var scrollBehaviorSnapshot = null;
        var priorScrollRestoration = "scrollRestoration" in window.history
            ? window.history.scrollRestoration
            : null;
        var journeyStart = 0;
        var journeyRange = 1;
        var lastScrollY = 0;
        var scrollDirection = 0;
        var scrollDirectionFrame = null;
        var disposers = [];

        root.classList.add("is-enhanced");
        root.classList.toggle("is-reduced", reducedMotion.matches);
        if (priorScrollRestoration !== null) {
            window.history.scrollRestoration = "manual";
        }

        function listen(target, eventName, handler, options) {
            target.addEventListener(eventName, handler, options);
            disposers.push(function () {
                target.removeEventListener(eventName, handler, options);
            });
        }

        function enableManualScrollRestoration() {
            if (priorScrollRestoration !== null) {
                window.history.scrollRestoration = "manual";
            }
        }

        function restoreScrollRestoration() {
            if (priorScrollRestoration !== null) {
                window.history.scrollRestoration = priorScrollRestoration;
            }
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
            handledHash = window.location.hash;
        }

        function measureJourney() {
            var documentTop = journey.getBoundingClientRect().top + window.scrollY;
            journeyStart = documentTop;
            journeyRange = Math.max(journey.offsetHeight - stage.offsetHeight, 1);
        }

        /*
         * Roots stay enclosed to the tree's own box: 0 while the tree shell
         * sits below the viewport, 1 once its box has fully passed the top.
         * The root system never sprawls across the rest of the page.
         */
        function treeBoxReveal() {
            var box = treeShell.getBoundingClientRect();
            var viewport = window.visualViewport
                ? window.visualViewport.height
                : window.innerHeight;
            return clamp((viewport - box.top) / (viewport + box.height), 0, 1);
        }

        function panelForFacet(facet) {
            return panels.find(function (panel) {
                return panel.getAttribute("data-life-panel") === facet;
            });
        }

        function mobileViewportMetrics(panel) {
            var header = document.querySelector(".md-header");
            var headerBottom = header ? header.getBoundingClientRect().bottom : 0;
            var scrollMargin = parseFloat(window.getComputedStyle(panel).scrollMarginTop);
            var viewport = window.visualViewport;
            return {
                bottom: viewport ? viewport.offsetTop + viewport.height : window.innerHeight,
                top: Math.max(
                    headerBottom + 16,
                    Number.isFinite(scrollMargin) ? scrollMargin : 0
                )
            };
        }

        function mobilePanelIsUsable(panel, viewport) {
            var heading = panel.querySelector("h2");
            var content = panel.querySelector(".life-dossier__lede");
            if (!heading || !content) return false;

            var headingRect = heading.getBoundingClientRect();
            var contentRect = content.getBoundingClientRect();
            return headingRect.top >= viewport.top - 1
                && headingRect.bottom <= viewport.bottom + 1
                && contentRect.top < viewport.bottom - 1
                && contentRect.bottom > viewport.top + 1;
        }

        function holdInstantScrolling() {
            var scroller = document.documentElement;
            if (scrollBehaviorFrame !== null) {
                window.cancelAnimationFrame(scrollBehaviorFrame);
                scrollBehaviorFrame = null;
            }
            if (!scrollBehaviorSnapshot) {
                scrollBehaviorSnapshot = {
                    priority: scroller.style.getPropertyPriority("scroll-behavior"),
                    value: scroller.style.getPropertyValue("scroll-behavior")
                };
            }
            scroller.style.setProperty("scroll-behavior", "auto", "important");
        }

        function restoreScrollBehavior() {
            if (!scrollBehaviorSnapshot) return;
            var scroller = document.documentElement;
            if (scrollBehaviorSnapshot.value) {
                scroller.style.setProperty(
                    "scroll-behavior",
                    scrollBehaviorSnapshot.value,
                    scrollBehaviorSnapshot.priority
                );
            } else {
                scroller.style.removeProperty("scroll-behavior");
            }
            scrollBehaviorSnapshot = null;
            scrollBehaviorFrame = null;
        }

        function releaseInstantScrolling() {
            if (!scrollBehaviorSnapshot) return;
            if (scrollBehaviorFrame !== null) {
                window.cancelAnimationFrame(scrollBehaviorFrame);
            }
            scrollBehaviorFrame = window.requestAnimationFrame(restoreScrollBehavior);
        }

        function scrollInstantly(target) {
            holdInstantScrolling();
            window.scrollTo({ top: Math.round(target), behavior: "instant" });
            releaseInstantScrolling();
        }

        function scrollToFacet(facet) {
            var index = FACETS.indexOf(facet);
            if (index === -1) return;

            if (desktopLayout.matches) {
                if (reducedMotion.matches) return;
                var fp = (index + 0.5) / FACETS.length;
                var progress = INTRO_END + fp * (1 - INTRO_END);
                var desktopTarget = journeyStart + journeyRange * progress;
                if (Math.abs(window.scrollY - desktopTarget) > 1) {
                    scrollInstantly(desktopTarget);
                }
                return;
            }

            var panel = panelForFacet(facet);
            if (!panel) return;
            var viewport = mobileViewportMetrics(panel);
            if (mobilePanelIsUsable(panel, viewport)) return;

            var panelTop = panel.getBoundingClientRect().top;
            var viewportHeight = window.visualViewport
                ? window.visualViewport.height
                : window.innerHeight;
            var maximum = Math.max(
                document.documentElement.scrollHeight - viewportHeight,
                0
            );
            var mobileTarget = clamp(
                window.scrollY + panelTop - viewport.top,
                0,
                maximum
            );
            if (Math.abs(window.scrollY - mobileTarget) > 1) {
                scrollInstantly(mobileTarget);
            }
        }

        function requestFacetAlignment(facet) {
            if (!isKnownFacet(facet)) return;
            pendingFacet = facet;
            if (alignmentFrame !== null) return;
            alignmentFrame = window.requestAnimationFrame(function () {
                var requestedFacet = pendingFacet;
                var scroller = document.scrollingElement || document.documentElement;
                alignmentFrame = null;
                pendingFacet = null;
                // Cancel an in-flight CSS smooth scroll before judging whether
                // the requested article is already usable. Assigning the
                // current offset is position-preserving.
                holdInstantScrolling();
                scroller.scrollTop = scroller.scrollTop;
                scrollToFacet(requestedFacet);
                releaseInstantScrolling();
            });
        }

        function applyProgress(rawProgress) {
            var progress = clamp(rawProgress, 0, 1);
            // Sequenced handoff: the intro bows out first (0.08-0.20), the
            // tree decamps to the left (0.10-0.38), then the dossier lands
            // (0.12-0.20). The dossier must be fully opaque before the Work
            // facet center at ~0.226, so every navigable section is solid.
            var introOpacity = 1 - clamp((progress - 0.08) / 0.12, 0, 1);
            var panelOpacity = clamp((progress - PANEL_START) / 0.08, 0, 1);
            var detail = 1 - (clamp((progress - 0.06) / 0.5, 0, 1) * 0.84);
            var pixelOpacity = clamp((progress - 0.14) / 0.34, 0, 0.9);

            // The planted flare is always present; the living root network
            // begins after the story opens, then reaches biological depth in
            // order: structural roots, laterals, and fine feeders. It resolves
            // while the tree still holds the stage, so the roots never sprawl
            // across the rest of the journey.
            var roots = easeInOutCubic(
                clamp((progress - 0.30) / 0.28, 0, 1)
            );

            var treeEased = easeInOutCubic(clamp((progress - 0.1) / 0.28, 0, 1));

            root.style.setProperty("--life-tree-x", (-22 * treeEased).toFixed(3) + "vw");
            root.style.setProperty("--life-tree-scale", (1.15 - (0.4 * treeEased)).toFixed(3));
            root.style.setProperty("--life-intro-opacity", introOpacity.toFixed(3));
            root.style.setProperty("--life-panel-opacity", panelOpacity.toFixed(3));
            root.style.setProperty("--life-panel-y", ((1 - panelOpacity) * 1.5).toFixed(3) + "rem");
            root.style.setProperty("--life-tree-detail", detail.toFixed(3));
            root.style.setProperty("--life-pixel-opacity", pixelOpacity.toFixed(3));
            root.style.setProperty("--life-roots", roots.toFixed(3));
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
            if (layoutTransitioning) return;

            // Track scroll direction for root pulse animation
            var currentScrollY = window.scrollY;
            var delta = currentScrollY - lastScrollY;
            if (Math.abs(delta) > 0.5) {
                scrollDirection = delta > 0 ? 1 : -1;
                lastScrollY = currentScrollY;
                var rootsEl = root.querySelector(".life-tree__roots");
                if (rootsEl) {
                    if (scrollDirection > 0) {
                        rootsEl.classList.add("scroll-down");
                    } else {
                        rootsEl.classList.remove("scroll-down");
                    }
                    if (scrollDirectionFrame !== null) {
                        window.cancelAnimationFrame(scrollDirectionFrame);
                    }
                    scrollDirectionFrame = window.requestAnimationFrame(function () {
                        scrollDirectionFrame = null;
                        setTimeout(function () {
                            if (rootsEl && window.scrollY === lastScrollY) {
                                rootsEl.classList.remove("scroll-down");
                            }
                        }, 1200);
                    });
                }
            }

            if (!desktopLayout.matches) {
                root.classList.add("is-open");
                root.classList.remove("is-indexed");
                var mobileRoots = reducedMotion.matches
                    ? 1
                    : easeInOutCubic(treeBoxReveal());
                root.style.setProperty(
                    "--life-roots",
                    (Number.isFinite(mobileRoots) ? mobileRoots : 0).toFixed(3)
                );
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
            requestFacetAlignment(nextFacet);
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
            controls[nextIndex].focus({ preventScroll: true });
            requestFacetAlignment(nextFacet);
        }

        function handleHistoryChange() {
            var currentHash = window.location.hash;
            if (currentHash === handledHash) return;
            handledHash = currentHash;
            var hashFacet = facetFromHash() || "work";
            committedFacet = hashFacet;
            selectFacet(hashFacet);
            requestFacetAlignment(hashFacet);
        }

        function handleResize() {
            measureJourney();
            if (!layoutTransitioning) {
                requestScrollUpdate();
            }
        }

        function handleReducedMotionChange() {
            root.classList.toggle("is-reduced", reducedMotion.matches);
            measureJourney();
            requestScrollUpdate();
        }

        function handleBreakpointChange() {
            var intendedFacet = facetFromHash() || activeFacet || committedFacet;
            layoutTransitioning = true;
            committedFacet = intendedFacet;
            measureJourney();
            selectFacet(intendedFacet);
            requestFacetAlignment(intendedFacet);

            if (layoutReleaseFrame !== null) {
                window.cancelAnimationFrame(layoutReleaseFrame);
            }
            layoutReleaseFrame = window.requestAnimationFrame(function () {
                layoutReleaseFrame = null;
                layoutTransitioning = false;
                measureJourney();
                requestScrollUpdate();
            });
        }

        function handleInitialHashAlignment() {
            var hashFacet = facetFromHash();
            if (!hashFacet) return;
            measureJourney();
            requestFacetAlignment(hashFacet);
        }

        controls.forEach(function (control) {
            listen(control, "click", handleControlClick);
            listen(control, "keydown", handleControlKeydown);
        });

        listen(window, "scroll", requestScrollUpdate, { passive: true });
        listen(window, "resize", handleResize, { passive: true });
        listen(window, "hashchange", handleHistoryChange);
        listen(window, "popstate", handleHistoryChange);
        listen(window, "pagehide", restoreScrollRestoration);
        listen(window, "pageshow", enableManualScrollRestoration);
        listen(desktopLayout, "change", handleBreakpointChange);
        listen(reducedMotion, "change", handleReducedMotionChange);

        selectFacet(committedFacet);
        measureJourney();
        updateScrollState();

        if (facetFromHash()) {
            if (document.readyState === "complete") {
                handleInitialHashAlignment();
            } else {
                listen(window, "load", handleInitialHashAlignment, { once: true });
            }
        }

        teardownCurrentIndex = function () {
            if (alignmentFrame !== null) {
                window.cancelAnimationFrame(alignmentFrame);
            }
            if (layoutReleaseFrame !== null) {
                window.cancelAnimationFrame(layoutReleaseFrame);
            }
            if (scrollBehaviorFrame !== null) {
                window.cancelAnimationFrame(scrollBehaviorFrame);
            }
            restoreScrollBehavior();
            restoreScrollRestoration();
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
