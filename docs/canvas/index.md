---
title: Canvas
description: Interactive Three.js scene gallery for generative studies and LLM-assisted visual experiments.
tags:
  - WebGL
  - JavaScript
  - Experiment
comments: false
---

# Canvas

Interactive studies live here as example pages, following the same useful pattern MapLibre uses for WebGL-heavy demos: the index stays quick to scan, and each scene page owns its live surface, controls, and implementation notes.

<div class="canvas-example-toolbar" markdown>

<span class="mlad-status mlad-status--active">Examples</span>
<span class="mlad-status">Three.js</span>
<span class="mlad-status">Zensical</span>
<span class="mlad-status">Theme-aware</span>

</div>

<div class="grid cards canvas-gallery" markdown>

-   :material-vector-triangle:{ .lg .middle } **Zen Geometry**

    ---

    A live Three.js network scene built around calm motion, responsive theming, and touch-friendly exploration.

    [:octicons-arrow-right-24: Open Scene](zen-geometry/index.md)

-   :material-cube-outline:{ .lg .middle } **Crystal Cave**

    ---

    Procedural formations, orbital camera movement, and theme-aware lighting. Planned as the next dedicated scene page.

    <span class="mlad-status mlad-status--experiment">Coming Soon</span>

-   :material-flare:{ .lg .middle } **Particle Flow**

    ---

    A future playground for field-driven motion, scroll velocity, and pointer-responsive particle systems.

    <span class="mlad-status mlad-status--experiment">Coming Soon</span>

</div>

## What Belongs Here

- Scenes should be opt-in, not loaded by browsing the main Canvas tab.
- Each scene gets a short purpose, direct controls, and a fallback for reduced motion or unsupported WebGL.
- The tab stays consistent with the rest of the site; the individual scene pages are where the experience can become immersive.

## Example Shape

Each scene page should answer four questions without making readers hunt:

- What does this scene demonstrate?
- How do I interact with it?
- Which browser or performance constraints matter?
- Where is the relevant implementation?
