---
title: Canvas
description: Full-screen Three.js showcase for background experiments.
hide:
  - navigation
  - toc
  - path
---

<style>
/* ===========================================
   Canvas Page Scoped Styles
   These styles ONLY apply to elements on this page
   =========================================== */

/* Hide UI elements for clean canvas experience */
.md-content__button,
.md-source-file,
.share-actions,
.md-content h1:first-of-type {
    display: none !important;
}

/* Reset content wrappers */
.md-main__inner {
    margin: 0 !important;
    padding: 0 !important;
    max-width: none !important;
}

.md-content {
    margin: 0 !important;
    padding: 0 !important;
    max-width: none !important;
    width: 100% !important;
}

.md-content__inner {
    margin: 0 !important;
    padding: 0 !important;
    max-width: none !important;
}

/* Canvas container - positioned by JavaScript */
#canvas-scene {
    position: fixed;
    left: 0;
    width: 100vw;
    z-index: 0;
    pointer-events: auto;
}

#canvas-scene canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
}
</style>

<!-- The Three.js scene is initialized by assets/js/canvas-scene.js -->
<!-- This script loads globally and handles instant navigation properly -->
