/*
 * Creative Canvas — shared environment helpers.
 *
 * Exposes window.CreativeCanvasEnv with color-token reading, DPR capping,
 * and reduced-motion detection so each sketch stays focused on its visuals.
 */
(function (global) {
  "use strict";

  function parseColor(value) {
    if (!value) return [0, 0, 0];
    var v = String(value).trim();

    if (v.charAt(0) === "#") {
      var hex = v.slice(1);
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      var n = parseInt(hex, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    var rgba = v.match(/rgba?\(([^)]+)\)/);
    if (rgba) {
      var parts = rgba[1].split(",").map(function (p) { return parseFloat(p); });
      return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
    }
    return [0, 0, 0];
  }

  function tokenScopeElement() {
    if (document.body && document.body.hasAttribute("data-md-color-scheme")) {
      return document.body;
    }
    if (document.documentElement.hasAttribute("data-md-color-scheme")) {
      return document.documentElement;
    }
    return document.querySelector("[data-md-color-scheme]") || document.documentElement;
  }

  function readToken(name, fallback) {
    var scope = tokenScopeElement();
    var raw = getComputedStyle(scope).getPropertyValue(name);
    if ((!raw || !raw.trim()) && scope !== document.documentElement) {
      raw = getComputedStyle(document.documentElement).getPropertyValue(name);
    }
    if (!raw || !raw.trim()) return parseColor(fallback);
    return parseColor(raw);
  }

  function capDpr(max) {
    var dpr = global.devicePixelRatio || 1;
    return Math.min(dpr, max || 2);
  }

  function prefersReducedMotion() {
    return global.matchMedia &&
      global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  global.CreativeCanvasEnv = {
    parseColor: parseColor,
    readToken: readToken,
    capDpr: capDpr,
    prefersReducedMotion: prefersReducedMotion,
    // Tokens consumed by sketches (resolved lazily so palette switches apply).
    tokens: function () {
      return {
        bg1: readToken("--creative-canvas-bg-1", "#f7f6f2"),
        bg2: readToken("--creative-canvas-bg-2", "#ece7df"),
        bg3: readToken("--creative-canvas-bg-3", "#e0dacf"),
        accent: readToken("--creative-canvas-accent", "#b35a3b"),
        particle: readToken("--creative-canvas-particle", "rgba(28,27,25,0.42)"),
        glow: readToken("--creative-canvas-glow", "rgba(179,90,59,0.22)"),
      };
    },
  };
})(window);
