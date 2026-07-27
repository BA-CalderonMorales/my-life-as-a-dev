/*
 * Creative Canvas — entry point.
 *
 * Finds every .creative-canvas container on the page, reads its
 * data-creative-canvas id, and boots the matching sketch from
 * window.CreativeCanvasSketches. New visuals are added by dropping a file in
 * sketches/ that registers itself and referencing its id in the markup — no
 * changes to this file or to the landing page are required.
 *
 * Accessibility / performance:
 *   - prefers-reduced-motion -> static token-colored gradient, no live canvas
 *   - pauses when the tab is hidden
 *   - caps devicePixelRatio
 */
(function (global) {
  "use strict";

  var ENV = global.CreativeCanvasEnv;
  var REGISTRY = global.CreativeCanvasSketches || {};

  function buildGrain() {
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "creative-canvas__grain");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("preserveAspectRatio", "none");

    var filter = document.createElementNS(svgNS, "filter");
    filter.setAttribute("id", "cc-grain-" + Math.random().toString(36).slice(2));
    var turb = document.createElementNS(svgNS, "feTurbulence");
    turb.setAttribute("type", "fractalNoise");
    turb.setAttribute("baseFrequency", "0.9");
    turb.setAttribute("numOctaves", "2");
    turb.setAttribute("stitchTiles", "stitch");
    filter.appendChild(turb);
    svg.appendChild(filter);

    var rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute("filter", "url(#" + filter.getAttribute("id") + ")");
    svg.appendChild(rect);
    return svg;
  }

  function boot(container) {
    if (container.dataset.ccMounted === "true") return;
    container.dataset.ccMounted = "true";

    if (ENV.prefersReducedMotion()) {
      container.classList.add("is-static");
      return;
    }

    var id = container.getAttribute("data-creative-canvas") || "aurora";
    var sketch = REGISTRY[id];
    if (!sketch || !sketch.mount) {
      container.classList.add("is-static");
      return;
    }

    var canvas = document.createElement("canvas");
    canvas.className = "creative-canvas__gl";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);
    container.appendChild(buildGrain());

    var ctrl = sketch.mount(canvas, ENV);
    if (!ctrl) {
      container.classList.add("is-static");
      return;
    }
    container.classList.add("is-ready");

    document.addEventListener("visibilitychange", function () {
      if (typeof ctrl.onVisibility === "function") {
        ctrl.onVisibility(!document.hidden);
      }
    });
  }

  function scan() {
    var nodes = document.querySelectorAll(".creative-canvas");
    for (var i = 0; i < nodes.length; i++) boot(nodes[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scan);
  } else {
    scan();
  }

  // Re-scan on MkDocs instant navigation (kept for safety; the landing page
  // is the only page that carries the container).
  if (typeof document$ !== "undefined") {
    document$.subscribe(scan);
  }
})(window);
