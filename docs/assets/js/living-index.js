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
        /*
         * The field's frame must CONTAIN its artwork: these strokes dive
         * from the ground line (y~405) down to y~546, so the band starts
         * just above the ground and runs deep. An earlier 0 0 1440 420
         * frame clipped everything below the ground line - a root system
         * beheaded at the soil.
         */
        var FIELD_VIEWBOX = "-40 392 1560 168";
        /*
         * Authored strokes, not grown by formula: five dominant divers
         * carry the system - each weaving, each descending decisively -
         * then a sparse tier of forks and a handful of hair feeders.
         * Nothing runs horizontal; long travel happens at depth. The
         * west and east systems differ in reach and rhythm on purpose.
         */
        var FIELD_PATHS = [
            // ── Primary scaffold: the dominant divers ──
            { tier: "primary", delay: 0.00, span: 0.40, width: 5.8,
              d: "M 450 400 C 442.9 403.5 421.8 413.1 407.2 421.2 C 392.6 429.2 376.8 440.6 362.2 448.3 C 347.7 456 334.6 461.5 319.9 467.4 C 305.2 473.4 289.8 479 274 484 C 258.2 489.1 241.8 493.7 225.2 497.9 C 208.7 502 190.5 505.7 174.6 509 C 158.7 512.3 146.3 514.5 130.1 517.6 C 113.9 520.6 93.9 524.2 77.4 527.4 C 61 530.7 47.3 534.4 31.4 537 C 15.5 539.6 -9.8 542 -18 543" },
            { tier: "primary", delay: 0.03, span: 0.34, width: 4.8,
              d: "M 462 404 C 457.6 407.3 444.6 416.7 435.6 423.9 C 426.7 431.1 415.8 439 408.2 447.2 C 400.6 455.4 396 464 390 473.2 C 384 482.4 379 493.1 372.3 502.2 C 365.7 511.4 353.7 523.7 350 528" },
            { tier: "primary", delay: 0.06, span: 0.36, width: 5.4,
              d: "M 470 402 C 469 406.7 463.6 420.6 463.8 430 C 463.9 439.4 469.1 449.5 471.1 458.5 C 473.1 467.5 474.6 474.9 475.6 484.1 C 476.6 493.3 475.1 504.5 476.8 513.8 C 478.6 523.1 484.5 535.6 486 540" },
            { tier: "primary", delay: 0.04, span: 0.38, width: 5.0,
              d: "M 478 404 C 485.6 406.2 508.9 411 523.4 417.4 C 537.9 423.9 551.4 433.6 565.3 442.5 C 579.1 451.5 592.6 461.7 606.5 471.1 C 620.3 480.5 635.8 488.7 648.4 498.9 C 661 509 676.4 526.5 682 532" },
            // east diver: shorter reach than its west twin, ends on a dive
            { tier: "primary", delay: 0.08, span: 0.42, width: 4.4,
              d: "M 472 402 C 480.4 404.6 506.9 412.5 522.4 417.8 C 537.9 423.2 549.7 429.1 564.9 433.9 C 580.1 438.7 597.3 443.3 613.6 446.8 C 629.9 450.4 645.5 452.7 662.7 455.4 C 680 458.1 700.4 460.1 717.2 462.9 C 733.9 465.8 747.2 468 763.1 472.5 C 779 476.9 798.1 481.5 812.6 489.6 C 827 497.7 843.8 515.8 850 521" },

            // ── Laterals: fork downward off a parent, then ease out ──
            { tier: "secondary", delay: 0.16, span: 0.26, width: 2.8,
              d: "M 300 468 C 296.3 469.5 285.4 474.2 278 477.2 C 270.7 480.2 264 483.8 256 486.1 C 248 488.3 238.2 489.4 230 490.9 C 221.7 492.4 214.3 492.8 206.7 494.8 C 199 496.9 187.8 501.6 184 503" },
            { tier: "secondary", delay: 0.22, span: 0.24, width: 2.4,
              d: "M 186 508 C 183.4 509 175.9 512.6 170.6 514.1 C 165.3 515.5 159.7 515.6 154.2 516.8 C 148.7 517.9 142.6 519.6 137.5 521 C 132.4 522.5 129.1 524.5 123.8 525.5 C 118.6 526.5 109 526.7 106 527" },
            { tier: "secondary", delay: 0.18, span: 0.26, width: 2.6,
              d: "M 472 470 C 469.5 470.8 461.5 472.3 456.8 474.6 C 452.1 476.9 448.3 480.8 443.9 483.6 C 439.5 486.5 435.2 489.6 430.6 491.6 C 426.1 493.6 421.4 494.1 416.7 495.7 C 411.9 497.3 404.4 500.1 402 501" },
            { tier: "secondary", delay: 0.24, span: 0.24, width: 2.3,
              d: "M 618 476 C 619.9 477 626 479.7 629.5 482.1 C 633.1 484.6 636.1 487.7 639.1 490.6 C 642.1 493.5 644.5 497.1 647.6 499.7 C 650.6 502.2 653.8 504 657.4 506.1 C 660.9 508.1 667.1 511 669 512" },
            { tier: "secondary", delay: 0.20, span: 0.25, width: 2.5,
              d: "M 576 450 C 575.2 451.4 572.8 455.9 571.2 458.6 C 569.6 461.3 567.7 463.4 566.3 466.2 C 564.9 469 564.1 472.5 562.7 475.4 C 561.3 478.3 559.9 481.2 558 483.6 C 556 486 552.2 488.9 551 490" },
            { tier: "secondary", delay: 0.26, span: 0.23, width: 2.2,
              d: "M 672 458 C 672.6 459.4 673.6 464.1 675.5 466.7 C 677.4 469.2 681.1 471.2 683.4 473.3 C 685.6 475.3 687 477 689.1 479.1 C 691.2 481.2 693.5 484 696.2 485.8 C 698.8 487.6 703.5 489.3 705 490" },
            { tier: "secondary", delay: 0.30, span: 0.22, width: 2.2,
              d: "M 812 488 C 813.5 488.6 818.4 490.1 821 491.9 C 823.5 493.6 824.9 496.4 827.3 498.4 C 829.6 500.5 832.1 502.6 834.9 504 C 837.6 505.5 840.9 505.9 843.8 507.1 C 846.6 508.2 850.6 510.3 852 511" },

            // ── Fine feeders: hair strokes finishing the system ──
            { tier: "fine", delay: 0.36, span: 0.18, width: 1.2,
              d: "M 352 447 C 350.9 447.7 347.5 449.5 345.4 451.1 C 343.3 452.6 341.4 454.7 339.6 456.3 C 337.8 457.8 336.7 459.2 334.7 460.4 C 332.6 461.5 329.8 462.3 327.4 463.3 C 324.9 464.2 321.2 465.5 320 466" },
            { tier: "fine", delay: 0.42, span: 0.16, width: 1.1,
              d: "M 186 508 C 184.8 508.5 181.3 509.9 178.9 510.9 C 176.6 511.9 174.4 513.2 171.9 514 C 169.4 514.8 166.4 515.1 164.1 515.6 C 161.7 516.2 160.1 516.5 157.7 517.2 C 155.4 518 151.3 519.5 150 520" },
            { tier: "fine", delay: 0.38, span: 0.18, width: 1.2,
              d: "M 398 462 C 397.2 462.9 394.7 466 393 467.4 C 391.3 468.8 389.5 469.1 387.9 470.6 C 386.2 472 384.5 474.1 383.2 476 C 381.8 477.9 380.9 480 379.5 481.9 C 378.2 483.7 375.8 486.1 375 487" },
            { tier: "fine", delay: 0.44, span: 0.16, width: 1.0,
              d: "M 480 504 C 479.3 504.7 476.9 506.8 475.8 508.2 C 474.8 509.7 474.6 511.1 473.7 512.6 C 472.8 514.1 471.6 515.9 470.3 517.3 C 469.1 518.8 467.6 520 466.4 521.4 C 465.1 522.9 463.6 525.2 463 526" },
            { tier: "fine", delay: 0.40, span: 0.17, width: 1.2,
              d: "M 654 504 C 654.7 504.6 656.8 506.5 658.1 507.9 C 659.3 509.3 660.2 511.2 661.2 512.6 C 662.2 514 662.8 515.2 664.2 516.3 C 665.5 517.3 667.6 518 669.2 519 C 670.8 519.9 673.2 521.5 674 522" },
            { tier: "fine", delay: 0.46, span: 0.16, width: 1.1,
              d: "M 742 474 C 742.8 474.7 745 476.8 746.5 478.2 C 748 479.6 749.4 481.3 751 482.5 C 752.7 483.7 754.9 484.6 756.5 485.6 C 758.2 486.5 759.2 487.3 760.8 488.3 C 762.4 489.4 765.1 491.4 766 492" }
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
            /*
             * The underlay stretches non-uniformly to cover any viewport,
             * so stroke weights would smear - hairline across, full down.
             * non-scaling-stroke pins every stroke to screen pixels; the
             * geometry still stretches, the ink weight never lies.
             * Wash twins lag their ink stroke by a fixed phase, reading
             * as wet bleed trailing the pen line instead of a ghost.
             */
            var WASH_PHASE_LAG = 0.06;
            var WASH_SPAN_STRETCH = 1.35;
            var WASH_OPACITY = { primary: 0.2, secondary: 0.14, fine: 0.09 };
            var WASH_WIDTH_RATIO = 2.0;
            FIELD_PATHS.forEach(function (spec) {
                var wash = document.createElementNS(svgNS, "path");
                wash.setAttribute("d", spec.d);
                wash.setAttribute("pathLength", "1");
                wash.setAttribute("vector-effect", "non-scaling-stroke");
                wash.setAttribute("class", "life-roots-field__root life-roots-field__root--wash");
                wash.style.setProperty("--field-delay", (spec.delay + WASH_PHASE_LAG).toFixed(2));
                wash.style.setProperty(
                    "--field-span",
                    Math.min(spec.span * WASH_SPAN_STRETCH, 0.5).toFixed(2)
                );
                wash.style.strokeWidth = (spec.width * WASH_WIDTH_RATIO).toFixed(1);
                wash.style.strokeOpacity = WASH_OPACITY[spec.tier];
                inner.appendChild(wash);

                var path = document.createElementNS(svgNS, "path");
                path.setAttribute("d", spec.d);
                path.setAttribute("pathLength", "1");
                path.setAttribute("vector-effect", "non-scaling-stroke");
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
         * The field is drawn around an origin cluster at x=460 in a 1560
         * grid starting at x=-40; the tree, though, slides left as the
         * story opens. Measure the trunk base on screen and slide the
         * field to match, so every root visibly grows out of the trunk
         * instead of floating nearby. The ground line sits at y=405, a
         * sliver from the top of the band - everything under it is root.
         */
        function alignRootsField() {
            var field = root.querySelector(".life-roots-field");
            var treeSvg = root.querySelector(".life-tree");
            if (!field || !treeSvg) return;
            var box = treeSvg.getBoundingClientRect();
            if (!box.width || !box.height) return;

            /*
             * One continuous system: the field's ground line must sit at
             * the trunk base on screen. Trunk base in viewBox coords:
             * (356, 708) of 720 x 1200. Field ground line: y=405 of the
             * band that spans y 392..560.
             */
            var trunkX = box.left + box.width * (356 / 720);
            var trunkY = box.top + box.height * (708 / 1200);

            var fieldH = field.getBoundingClientRect().height || window.innerHeight * 0.5;
            var flareFrac = (460 - (-40)) / 1560;
            var groundFromTop = fieldH * ((405 - 392) / 168);

            /*
             * While the trunk holds the stage, the field hangs from its
             * base - one continuous system, the flare tucked just beneath
             * the visible trunk foot. Once the tree decamps, the field
             * returns to its neutral full-bleed post at the bottom.
             */
            var onStage = trunkY > -window.innerHeight * 0.2 &&
                trunkY < window.innerHeight;
            var shiftX = 0;
            var shiftY = 0;
            if (onStage) {
                shiftX = trunkX - window.innerWidth * flareFrac;
                var fieldTopTarget = trunkY - groundFromTop + fieldH * 0.10;
                shiftY = fieldTopTarget - (window.innerHeight - fieldH);
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
