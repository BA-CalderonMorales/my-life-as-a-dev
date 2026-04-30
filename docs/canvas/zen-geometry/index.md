---
title: Zen Geometry
description: Full-screen Three.js network scene with theme-aware motion and touch interaction.
tags:
  - WebGL
  - JavaScript
  - Experiment
hide:
  - toc
  - path
comments: false
---

# Zen Geometry

This scene turns system architecture into a playable spatial sketch: nodes, connections, and subtle motion that respond to pointer and touch input. It is loaded only on this page, keeping the Canvas index fast and predictable.

<section class="canvas-example-shell" markdown>

<div class="canvas-example-header" markdown>

<div markdown>

## Live Example

Move the pointer to pull the structure, drag on touch screens to orbit, and switch the site theme to change the atmosphere.

</div>

<div class="canvas-example-actions" markdown>

[Back to Canvas](../index.md){ .md-button }

</div>
</div>

<div id="canvas-scene" class="canvas-scene-viewport" role="img" aria-label="Interactive Three.js Zen Geometry scene"></div>

<div class="canvas-example-meta" markdown>

<div markdown>

**Demonstrates**

- Three.js scene lifecycle inside Zensical instant navigation
- Light and dark theme synchronization
- Pointer and touch interaction without loading on the Canvas overview

</div>

<div markdown>

**Implementation**

- Entry: `docs/assets/js/canvas/scene/main.js`
- Scene: `docs/assets/js/canvas/scene/ZenGeometryScene.js`
- Model: `docs/assets/js/canvas/scene/ZenGeometryModel.js`

</div>

</div>

</section>

## Minimal Page Hook

```html
<div id="canvas-scene" class="canvas-scene-viewport"></div>
```

The scene bootstrap looks for that element only on `/canvas/zen-geometry/`, initializes Three.js there, and destroys the renderer when instant navigation leaves the page.
