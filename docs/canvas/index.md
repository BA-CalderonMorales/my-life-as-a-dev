---
title: Canvas
description: Full-screen Three.js showcase for background experiments and generative studies.
tags:
  - WebGL
  - JavaScript
  - Experiment
hide:
  - toc
  - path
comments: false
---

# Canvas

A full-screen space for generative experiments. Each scene is built with Three.js and responds to the site's theme — light or dark, calm or curious.

---

## Current Scene

The canvas below runs a crystal cave simulation: procedural geometry, orbital camera, and particle atmospheres that shift with the page theme. Click and drag to explore. Scroll to zoom.

---

## Experiments

<div class="grid cards" markdown>

-   :material-cube-outline:{ .lg .middle } **Crystal Cave**

    ---

    Procedural crystal formations with orbital camera and particle effects. Theme-responsive lighting.

    [:octicons-arrow-right-24: View Live](#){ .md-button }

-   :material-weather-windy:{ .lg .middle } **Zen Geometry**

    ---

    Minimal geometric studies with smooth camera transitions and ambient motion.

    [:octicons-arrow-right-24: View Live](#){ .md-button }

-   :material-flare:{ .lg .middle } **Particle Flow**

    ---

    Flowing particle systems driven by noise fields and scroll velocity.

    [:octicons-arrow-right-24: View Live](#){ .md-button }

</div>

---

## Notes

- Canvas scenes load on this page only to preserve performance elsewhere.
- All scenes respect `prefers-reduced-motion` and fall back to static frames.
- Built with Three.js r160 and vanilla JavaScript. No React, no bundler.
