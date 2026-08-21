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
         * The freed root field: a full-bleed underlay pinned to the bottom of
         * the viewport. Where the tree's own roots stay planted in the stage,
         * these escape it - drawn curves that fan across the whole width and
         * reach further as the reader scrolls. Authored by hand, not grown by
         * formula: every path here is a deliberate stroke, thick primaries
         * first, fine feeders last, each with its own reveal window.
         */
        var FIELD_VIEWBOX = "0 0 1440 420";
                var FIELD_PATHS = [
            // ── Primary scaffold: heavy strokes straight from the trunk base ──
            { tier: "primary", delay: 0.00, span: 0.42, width: 6.2,
              d: "M 452 402 C 400 398 330 404 268 388 C 196 370 120 372 60 342 C 20 322 -60 296 -170 264" },
            { tier: "primary", delay: 0.03, span: 0.44, width: 5.6,
              d: "M 462 406 C 420 420 356 416 300 424 C 220 434 140 418 84 380 C 40 356 -40 330 -140 300" },
            { tier: "primary", delay: 0.06, span: 0.46, width: 6.6,
              d: "M 474 404 C 480 414 492 418 508 420 L 560 419 C 664 416 780 424 892 408 C 1010 390 1120 386 1224 356 C 1320 330 1480 304 1630 270" },
            { tier: "primary", delay: 0.09, span: 0.44, width: 5.2,
              d: "M 468 408 C 500 416 560 430 640 428 C 760 426 900 438 1040 428 C 1180 418 1440 402 1610 358" },
            { tier: "primary", delay: 0.05, span: 0.40, width: 5.8,
              d: "M 466 405 C 460 412 452 415 446 418 C 430 424 414 428 402 436 C 386 446 372 452 360 462" },
            { tier: "primary", delay: 0.08, span: 0.42, width: 5.4,
              d: "M 478 406 C 512 418 540 432 570 444 C 610 460 650 468 700 476" },
            { tier: "primary", delay: 0.07, span: 0.41, width: 5.0,
              d: "M 458 404 C 436 416 410 424 386 436 C 350 452 320 462 290 474" },

            // ── Laterals: each forks from a point on its parent primary ──
            { tier: "secondary", delay: 0.14, span: 0.30, width: 3.1,
              d: "M 330 403 C 296 396 264 398 232 388 C 200 378 176 380 152 370" },
            { tier: "secondary", delay: 0.18, span: 0.28, width: 2.7,
              d: "M 196 371 C 168 362 144 364 118 354 C 96 346 78 348 62 340" },
            { tier: "secondary", delay: 0.22, span: 0.30, width: 2.9,
              d: "M 300 424 C 272 430 246 428 218 434 C 190 440 166 436 142 442" },
            { tier: "secondary", delay: 0.20, span: 0.28, width: 2.6,
              d: "M 140 419 C 116 412 94 416 72 408 C 52 402 36 404 22 398" },
            { tier: "secondary", delay: 0.16, span: 0.30, width: 3.0,
              d: "M 664 416 C 700 410 730 414 764 406 C 800 398 828 400 856 392" },
            { tier: "secondary", delay: 0.24, span: 0.30, width: 2.8,
              d: "M 892 408 C 924 414 954 412 986 418 C 1020 424 1050 420 1080 426" },
            { tier: "secondary", delay: 0.20, span: 0.28, width: 2.7,
              d: "M 1120 386 C 1150 378 1178 380 1206 372 C 1236 364 1260 366 1282 358" },
            { tier: "secondary", delay: 0.26, span: 0.28, width: 2.8,
              d: "M 760 426 C 792 432 820 430 852 436 C 886 442 916 440 946 446" },
            { tier: "secondary", delay: 0.28, span: 0.26, width: 2.5,
              d: "M 1040 428 C 1072 424 1100 428 1130 422 C 1162 416 1188 418 1212 412" },
            { tier: "secondary", delay: 0.24, span: 0.26, width: 2.6,
              d: "M 446 418 C 452 428 450 438 456 448 C 462 458 460 466 466 474" },
            { tier: "secondary", delay: 0.28, span: 0.24, width: 2.4,
              d: "M 386 436 C 366 444 348 442 330 450" },
            { tier: "secondary", delay: 0.30, span: 0.24, width: 2.4,
              d: "M 570 444 C 592 452 616 454 638 462" },

            // ── Fine feeders: hair strokes finishing the system ──
            { tier: "fine", delay: 0.38, span: 0.20, width: 1.5,
              d: "M 232 388 C 214 384 198 386 182 380" },
            { tier: "fine", delay: 0.42, span: 0.18, width: 1.2,
              d: "M 152 370 C 138 366 126 368 114 362" },
            { tier: "fine", delay: 0.40, span: 0.20, width: 1.4,
              d: "M 124 371 C 106 366 92 368 76 362" },
            { tier: "fine", delay: 0.44, span: 0.18, width: 1.2,
              d: "M 118 354 C 104 350 92 352 80 346" },
            { tier: "fine", delay: 0.40, span: 0.20, width: 1.3,
              d: "M 218 434 C 202 438 188 436 172 440" },
            { tier: "fine", delay: 0.46, span: 0.18, width: 1.2,
              d: "M 72 408 C 58 404 46 406 34 400" },
            { tier: "fine", delay: 0.38, span: 0.20, width: 1.4,
              d: "M 764 406 C 780 402 794 404 810 400" },
            { tier: "fine", delay: 0.44, span: 0.18, width: 1.2,
              d: "M 856 392 C 872 388 886 390 900 386" },
            { tier: "fine", delay: 0.42, span: 0.20, width: 1.3,
              d: "M 986 418 C 1002 422 1016 420 1032 424" },
            { tier: "fine", delay: 0.46, span: 0.18, width: 1.2,
              d: "M 1206 372 C 1222 368 1236 370 1252 366" },
            { tier: "fine", delay: 0.50, span: 0.16, width: 1.1,
              d: "M 1282 358 C 1298 354 1312 356 1328 352" },
            { tier: "fine", delay: 0.44, span: 0.18, width: 1.2,
              d: "M 1130 422 C 1146 418 1160 420 1176 416" },
            { tier: "fine", delay: 0.36, span: 0.20, width: 1.3,
              d: "M 560 419 C 574 424 588 422 602 426" },
            { tier: "fine", delay: 0.40, span: 0.18, width: 1.2,
              d: "M 222 433 C 206 437 192 435 178 439" },
            { tier: "fine", delay: 0.46, span: 0.16, width: 1.2,
              d: "M 610 460 C 624 464 638 462 652 466" },
            { tier: "fine", delay: 0.48, span: 0.16, width: 1.1,
              d: "M 320 462 C 306 466 294 464 280 468" },
            { tier: "fine", delay: 0.34, span: 0.20, width: 1.3,
              d: "M 500 421 C 512 424 524 422 536 425" },
            { tier: "fine", delay: 0.36, span: 0.18, width: 1.2,
              d: "M 440 419 C 428 423 418 421 406 424" }
        ];

        function buildRootsField() {
            if (root.querySelector(".life-roots-field")) return;
            var svgNS = "http://www.w3.org/2000/svg";
            var svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("class", "life-roots-field");
            svg.setAttribute("viewBox", FIELD_VIEWBOX);
            svg.setAttribute("preserveAspectRatio", "none");
            svg.setAttribute("aria-hidden", "true");
            svg.setAttribute("focusable", "false");
            var inner = document.createElementNS(svgNS, "g");
            inner.setAttribute("class", "life-roots-field__inner");
            var WASH_OPACITY = { primary: 0.26, secondary: 0.18, fine: 0.12 };
            FIELD_PATHS.forEach(function (spec) {
                var wash = document.createElementNS(svgNS, "path");
                wash.setAttribute("d", spec.d);
                wash.setAttribute("pathLength", "1");
                wash.setAttribute("class", "life-roots-field__root life-roots-field__root--wash");
                wash.style.setProperty("--field-delay", spec.delay.toFixed(2));
                wash.style.setProperty("--field-span", spec.span.toFixed(2));
                wash.style.strokeWidth = (spec.width * 2.8).toFixed(1);
                wash.style.strokeOpacity = WASH_OPACITY[spec.tier];
                inner.appendChild(wash);

                var path = document.createElementNS(svgNS, "path");
                path.setAttribute("d", spec.d);
                path.setAttribute("pathLength", "1");
                path.setAttribute("class", "life-roots-field__root life-roots-field__root--" + spec.tier);
                path.style.setProperty("--field-delay", spec.delay.toFixed(2));
                path.style.setProperty("--field-span", spec.span.toFixed(2));
                path.style.strokeWidth = spec.width;
                inner.appendChild(path);
            });
            svg.appendChild(inner);
            root.appendChild(svg);
        }

        /*
         * The field is drawn around an origin cluster at x=460 in a 1440
         * grid; the tree, though, slides left as the story opens. Measure
         * the trunk base on screen and slide the field to match, so every
         * root visibly grows out of the trunk instead of floating nearby.
         */
        function alignRootsField() {
            var field = root.querySelector(".life-roots-field");
            var treeSvg = root.querySelector(".life-tree");
            if (!field || !treeSvg) return;
            var box = treeSvg.getBoundingClientRect();
            if (!box.width) return;
            var trunkX = box.left + box.width * 0.5;
            var shift = trunkX - window.innerWidth * (460 / 1440);
            field.style.transform = "translateX(" + shift.toFixed(1) + "px)";
        }

        buildRootsField();

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

            // The freed field keeps reaching through nearly the whole journey:
            // it starts as soon as the story opens and finishes near the coda,
            // so the ground feels alive under the entire read.
            var fieldRoots = easeInOutCubic(
                clamp((progress - 0.04) / 0.72, 0, 1)
            );

            var treeEased = easeInOutCubic(clamp((progress - 0.1) / 0.28, 0, 1));

            root.style.setProperty("--life-tree-x", (-22 * treeEased).toFixed(3) + "vw");
            root.style.setProperty("--life-tree-scale", (1.07 - (0.38 * treeEased)).toFixed(3));
            root.style.setProperty("--life-intro-opacity", introOpacity.toFixed(3));
            root.style.setProperty("--life-panel-opacity", panelOpacity.toFixed(3));
            root.style.setProperty("--life-panel-y", ((1 - panelOpacity) * 1.5).toFixed(3) + "rem");
            root.style.setProperty("--life-tree-detail", detail.toFixed(3));
            root.style.setProperty("--life-pixel-opacity", pixelOpacity.toFixed(3));
            root.style.setProperty("--life-roots", roots.toFixed(3));
            root.style.setProperty("--life-field-roots", fieldRoots.toFixed(3));
            root.style.setProperty("--life-meter", (progress * 100).toFixed(1) + "%");
            root.classList.toggle("is-indexed", progress > 0.08);
            root.classList.toggle("is-open", progress > PANEL_START);
            alignRootsField();

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
                root.style.setProperty(
                    "--life-field-roots",
                    (Number.isFinite(mobileRoots) ? mobileRoots : 0).toFixed(3)
                );
                alignRootsField();
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
