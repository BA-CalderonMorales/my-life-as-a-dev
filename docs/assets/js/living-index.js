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
            // ── Primary scaffold: heavy sinkers that dive from the flare ──
            // Every root leaves the base descending; long travel happens at
            // depth, the way real roots spread under the ground line.
            { tier: "primary", delay: 0.00, span: 0.42, width: 6.2,
              d: "M 450 400 C 404 418 362 442 320 462 C 270 486 210 504 150 516 C 96 526 40 532 -30 536" },
            { tier: "primary", delay: 0.03, span: 0.44, width: 5.6,
              d: "M 458 406 C 420 418 384 434 344 446 C 296 460 244 468 190 476 C 134 484 74 490 14 496" },
            { tier: "primary", delay: 0.06, span: 0.46, width: 6.6,
              d: "M 474 402 C 520 420 562 444 606 464 C 658 488 720 506 786 518 C 844 528 902 534 970 538" },
            { tier: "primary", delay: 0.09, span: 0.44, width: 5.2,
              d: "M 468 408 C 508 420 552 436 600 450 C 656 466 718 476 784 484 C 850 490 916 494 986 498" },
            { tier: "primary", delay: 0.05, span: 0.40, width: 5.8,
              d: "M 466 404 C 458 424 450 446 444 468 C 438 492 430 514 422 536" },
            { tier: "primary", delay: 0.08, span: 0.42, width: 5.4,
              d: "M 480 406 C 512 424 542 444 570 464 C 600 486 626 504 650 522" },
            { tier: "primary", delay: 0.07, span: 0.41, width: 5.0,
              d: "M 456 404 C 432 422 408 442 384 462 C 358 484 332 502 306 520" },

            // ── Laterals: fork downward off a parent, then ease outward ──
            { tier: "secondary", delay: 0.14, span: 0.30, width: 3.1,
              d: "M 320 462 C 296 476 272 488 248 496 C 228 503 208 508 188 512" },
            { tier: "secondary", delay: 0.18, span: 0.28, width: 2.7,
              d: "M 190 476 C 172 486 154 494 136 500 C 122 505 108 508 94 510" },
            { tier: "secondary", delay: 0.22, span: 0.30, width: 2.9,
              d: "M 344 446 C 320 456 296 464 272 470 C 250 475 228 478 206 480" },
            { tier: "secondary", delay: 0.20, span: 0.28, width: 2.6,
              d: "M 240 468 C 222 477 204 484 186 489 C 170 493 154 496 138 498" },
            { tier: "secondary", delay: 0.16, span: 0.30, width: 3.0,
              d: "M 606 464 C 632 476 658 486 686 494 C 712 501 738 506 764 509" },
            { tier: "secondary", delay: 0.24, span: 0.30, width: 2.8,
              d: "M 786 518 C 812 525 838 530 866 534 C 892 537 918 539 944 540" },
            { tier: "secondary", delay: 0.20, span: 0.28, width: 2.7,
              d: "M 720 506 L 721 506 M 720 506 C 742 515 764 523 788 529 C 810 534 832 538 854 541" },
            { tier: "secondary", delay: 0.26, span: 0.28, width: 2.8,
              d: "M 600 450 C 618 460 636 469 656 477 C 674 484 692 490 710 495" },
            { tier: "secondary", delay: 0.28, span: 0.26, width: 2.5,
              d: "M 656 466 C 674 474 692 481 712 487 C 730 492 748 496 766 499" },
            { tier: "secondary", delay: 0.24, span: 0.26, width: 2.6,
              d: "M 444 468 C 456 478 466 488 474 498 C 481 507 487 516 491 524" },
            { tier: "secondary", delay: 0.28, span: 0.24, width: 2.4,
              d: "M 392 462 C 380 472 368 482 356 491" },
            { tier: "secondary", delay: 0.30, span: 0.24, width: 2.4,
              d: "M 570 464 C 582 473 594 481 608 489" },

            // ── Fine feeders: hair strokes finishing the system ──
            { tier: "fine", delay: 0.38, span: 0.20, width: 1.5,
              d: "M 248 496 C 234 502 220 507 206 511" },
            { tier: "fine", delay: 0.42, span: 0.18, width: 1.2,
              d: "M 188 512 C 176 516 164 519 152 521" },
            { tier: "fine", delay: 0.40, span: 0.20, width: 1.4,
              d: "M 206 480 C 194 486 182 491 170 495" },
            { tier: "fine", delay: 0.44, span: 0.18, width: 1.2,
              d: "M 138 498 L 139 498 M 138 498 C 128 503 118 507 108 510" },
            { tier: "fine", delay: 0.40, span: 0.20, width: 1.3,
              d: "M 272 470 C 260 475 248 479 236 482" },
            { tier: "fine", delay: 0.46, span: 0.18, width: 1.2,
              d: "M 686 494 C 700 499 714 503 728 507" },
            { tier: "fine", delay: 0.44, span: 0.18, width: 1.2,
              d: "M 766 509 C 780 513 794 516 808 518" },
            { tier: "fine", delay: 0.42, span: 0.20, width: 1.3,
              d: "M 866 534 C 880 537 894 539 908 540" },
            { tier: "fine", delay: 0.46, span: 0.18, width: 1.2,
              d: "M 712 487 C 724 491 736 494 748 497" },
            { tier: "fine", delay: 0.50, span: 0.16, width: 1.1,
              d: "M 854 541 C 866 543 878 545 890 546" },
            { tier: "fine", delay: 0.44, span: 0.18, width: 1.2,
              d: "M 656 477 C 668 482 680 486 692 490" },
            { tier: "fine", delay: 0.36, span: 0.20, width: 1.3,
              d: "M 474 498 C 482 505 489 512 495 519" },
            { tier: "fine", delay: 0.40, span: 0.18, width: 1.2,
              d: "M 491 524 C 497 530 502 536 506 542" },
            { tier: "fine", delay: 0.46, span: 0.16, width: 1.2,
              d: "M 608 489 C 618 494 628 498 638 502" },
            { tier: "fine", delay: 0.48, span: 0.16, width: 1.1,
              d: "M 356 491 C 346 498 336 504 326 510" },
            { tier: "fine", delay: 0.34, span: 0.20, width: 1.3,
              d: "M 516 472 C 526 478 536 484 546 490" },
            { tier: "fine", delay: 0.36, span: 0.18, width: 1.2,
              d: "M 542 444 L 543 444 M 542 444 C 552 451 562 457 572 463" }
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
            if (!box.width || !box.height) return;

            /*
             * One continuous system: the field's ground line must sit at
             * the trunk base on screen - never at the svg bounding box
             * bottom, which reserves empty viewBox space below the base.
             * Trunk base in viewBox coords: (356, 708) of 720 x 1200.
             * Field ground line: y ~= 405 of the 420-tall field grid.
             */
            var trunkX = box.left + box.width * (356 / 720);
            var trunkY = box.top + box.height * (708 / 1200);

            var fieldH = field.getBoundingClientRect().height || window.innerHeight * 0.5;
            var groundFromBottom = fieldH * ((420 - 405) / 420);
            var desiredBottomY = trunkY + groundFromBottom * 0.4;

            /*
             * While the trunk holds the stage, the field hangs from its
             * base - one continuous system. Once the tree decamps, the
             * field returns to its neutral full-bleed post at the bottom.
             */
            var onStage = trunkY > -window.innerHeight * 0.2 &&
                trunkY < window.innerHeight;
            var shiftX = 0;
            var shiftY = 0;
            if (onStage) {
                shiftX = trunkX - window.innerWidth * (460 / 1440);
                shiftY = desiredBottomY - window.innerHeight;
            }

            field.style.transform = "translate(" + shiftX.toFixed(1) + "px, " +
                shiftY.toFixed(1) + "px)";
        }

        buildRootsField();

        /*
         * Roots stay enclosed to the tree's own box: 0 while the tree shell
         * sits below the viewport, 1 once its box has fully passed the top.
         * The ratio keys off scroll travel against the shell's full document
         * extent, so every viewport starts with exactly zero root ink no
         * matter how much of the shell already peeks into view at rest.
         */
        function treeBoxReveal() {
            var box = treeShell.getBoundingClientRect();
            var viewport = window.visualViewport
                ? window.visualViewport.height
                : window.innerHeight;
            var shellExtent = box.top + window.scrollY + box.height;
            if (shellExtent <= 0) return 0;
            return clamp(window.scrollY / shellExtent, 0, 1);
        }

        /*
         * Growth pressure: tiers hang in a cascade, the way real roots
         * branch. Each tier chases its own target on a slightly-
         * underdamped spring, and every child's target derives from its
         * parent's ACTUAL position - laterals only wake once the heavy
         * wood is underway, feeders only flick out off existing laterals.
         * A child can never outrun its parent. Because the springs lag
         * the reader, roots surge while scrolling and settle with a
         * believable overshoot when they pause; mid-scroll pauses freeze
         * partial systems mid-growth. Overshoot past 0..1 is safe: every
         * reveal window clamps independently.
         */
        var GROWTH_TIERS = [
            { name: "primary", stiffness: 36, damping: 11 },
            { name: "lateral", stiffness: 64, damping: 15 },
            { name: "fine", stiffness: 130, damping: 18 }
        ];
        var GROWTH_CASCADE = {
            lateral: { wake: 0.18, span: 0.62 },
            fine: { wake: 0.24, span: 0.58 }
        };
        var growthTarget = 0;
        var growthStates = {};
        var growthFrame = null;
        var growthLastTime = 0;
        GROWTH_TIERS.forEach(function (tier) {
            growthStates[tier.name] = { x: 0, v: 0 };
        });

        function writeGrowthVars() {
            GROWTH_TIERS.forEach(function (tier) {
                var state = growthStates[tier.name];
                root.style.setProperty(
                    "--life-roots-" + tier.name,
                    state.x.toFixed(4)
                );
            });
        }

        function springToward(tier, target, dt) {
            var state = growthStates[tier.name];
            var accel = -tier.stiffness * (state.x - target)
                - tier.damping * state.v;
            state.v += accel * dt;
            state.x += state.v * dt;
            if (Math.abs(state.x - target) < 0.0005
                && Math.abs(state.v) < 0.002) {
                state.x = target;
                state.v = 0;
                return false;
            }
            return true;
        }

        function cascadeTarget(name, parentX) {
            var gate = GROWTH_CASCADE[name];
            return clamp((parentX - gate.wake) / gate.span, 0, 1);
        }

        function stepGrowth(now) {
            growthFrame = null;
            var dt = growthLastTime
                ? Math.min((now - growthLastTime) / 1000, 0.05)
                : 1 / 60;
            growthLastTime = now;
            var awake = false;
            awake = springToward(GROWTH_TIERS[0], growthTarget, dt) || awake;
            for (var i = 1; i < GROWTH_TIERS.length; i++) {
                var tier = GROWTH_TIERS[i];
                var parentX = growthStates[GROWTH_TIERS[i - 1].name].x;
                awake = springToward(
                    tier,
                    cascadeTarget(tier.name, parentX),
                    dt
                ) || awake;
            }
            writeGrowthVars();
            if (awake) {
                growthFrame = window.requestAnimationFrame(stepGrowth);
            } else {
                growthLastTime = 0;
            }
        }

        function driveRootGrowth(target, animate) {
            var value = clamp(target, 0, 1);
            root.style.setProperty("--life-roots", value.toFixed(3));
            if (growthFrame !== null) {
                window.cancelAnimationFrame(growthFrame);
                growthFrame = null;
            }
            if (!animate) {
                GROWTH_TIERS.forEach(function (tier) {
                    growthStates[tier.name].x = value;
                    growthStates[tier.name].v = 0;
                });
                growthLastTime = 0;
                writeGrowthVars();
                return;
            }
            growthTarget = value;
            growthFrame = window.requestAnimationFrame(stepGrowth);
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
            }
            if (growthFrame !== null) {
                window.cancelAnimationFrame(growthFrame);
                growthFrame = null;
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
            // Sequenced handoff with DISJOINT windows: the intro and its
            // pills are fully gone by 0.13, only then does the dossier
            // begin to land (0.145-0.215), so no scroll position ever
            // shows two text layers at partial opacity. The tree decamps
            // through the quiet gap as art, never competing with copy.
            // The dossier must be fully opaque before the Work facet
            // center at ~0.226, so every navigable section is solid.
            var introOpacity = 1 - clamp((progress - 0.05) / 0.08, 0, 1);
            var panelOpacity = clamp((progress - 0.145) / 0.07, 0, 1);
            var detail = 1 - (clamp((progress - 0.06) / 0.5, 0, 1) * 0.84);
            var pixelOpacity = clamp((progress - 0.14) / 0.34, 0, 0.9);

            // The planted flare is always present; the living root network
            // begins as the story opens and reaches biological depth in
            // order: structural sinkers, laterals, and fine feeders. It
            // resolves while the tree still holds the stage, so the roots
            // never sprawl across the rest of the journey. The raw window
            // feeds the tier springs - they supply the easing character.
            var roots = clamp((progress - 0.10) / 0.34, 0, 1);

            // The freed field keeps reaching through most of the journey,
            // but only after the handoff settles - never at rest.
            var fieldRoots = easeInOutCubic(
                clamp((progress - 0.13) / 0.60, 0, 1)
            );

            var treeEased = easeInOutCubic(clamp((progress - 0.1) / 0.28, 0, 1));

            root.style.setProperty("--life-tree-x", (-22 * treeEased).toFixed(3) + "vw");
            root.style.setProperty("--life-tree-scale", (1.07 - (0.38 * treeEased)).toFixed(3));
            root.style.setProperty("--life-intro-opacity", introOpacity.toFixed(3));
            root.style.setProperty("--life-panel-opacity", panelOpacity.toFixed(3));
            root.style.setProperty("--life-panel-y", ((1 - panelOpacity) * 1.5).toFixed(3) + "rem");
            root.style.setProperty("--life-tree-detail", detail.toFixed(3));
            root.style.setProperty("--life-pixel-opacity", pixelOpacity.toFixed(3));
            driveRootGrowth(roots, !reducedMotion.matches);
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
                driveRootGrowth(
                    Number.isFinite(mobileRoots) ? mobileRoots : 0,
                    !reducedMotion.matches
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
