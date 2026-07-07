---
title: Immersive Awe Canvas
description: Interactive WebGL worlds with time-of-day controls, responsive theming, and agent-friendly repo automation.
tags:
  - Experiment
  - WebGL
  - React
  - JavaScript
comments: true
---

# Immersive Awe Canvas

> Interactive WebGL worlds with time-of-day controls, responsive theming, and agent-friendly repo automation.

---

## Signal

!!! info "Project Signal"

	- **Status**: Experiment, shipping visual updates bi-weekly -> monthly basis.
	- **Focus**: 3D scene exploration + live parameter editing
	- **Stack**: React, Three.js, Zustand state, deployment via Lovable + GitHub Pages
	- **Ideal For**: Frontend devs exploring creative coding patterns

## Quick Links

- [:fontawesome-brands-github: Repository](https://github.com/BA-CalderonMorales/immersive-awe-canvas)
- [Production Demo](https://immersive-awe-canvas.lovable.app)
- [QA Build](https://ba-calderonmorales.github.io/immersive-awe-canvas)
- [Issue Tracker](https://github.com/BA-CalderonMorales/immersive-awe-canvas/issues)

## Onboarding Checklist

1. Clone the repo and install dependencies (`pnpm install` per the project README).
2. Start the dev server with `pnpm dev` to load the canvas playground and inspector panel.
3. Explore `agents/` for RULES + MEMORY to understand how automated contributors should behave.

## Highlights

- Toggle between curated scenes, adjust time-of-day gradients, and see lighting changes instantly.
- Live inspector exposes camera, fog, and particle settings backed by Zustand state snapshots.
- Framework-driven `agents/` directory keeps repo automation consistent with Docs-as-Code standards.

## Code Snapshot

=== "Scene Component"

    ```tsx
    import { Canvas } from '@react-three/fiber';
    import { OrbitControls, Environment } from '@react-three/drei';
    import { useThemeStore } from '../stores/theme';

    export function AweScene() {
      const { gradient, fog } = useThemeStore();

      return (
        <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
          <fog attach="fog" args={[fog, 5, 30]} />
          <Environment preset="sunset" />
          <OrbitControls enableZoom={false} />
          {/* Scene children rendered here */}
        </Canvas>
      );
    }
    ```

=== "Install"

    ```bash
    # Clone and start the dev server
    git clone https://github.com/BA-CalderonMorales/immersive-awe-canvas.git
    cd immersive-awe-canvas
    pnpm install
    pnpm dev
    ```

## Core Scenarios

- **Creative prototyping**: Quickly concept ambient hero sections or marketing visuals inside a browser.
- **Design handoff**: Share Lovable-hosted builds so designers can tweak parameters before exporting captures.
- **Agent workflows**: Use consistent RULES/MEMORY files to script GitHub Copilot-style agents inside the repo.

## Documentation Map

| Document | Description |
| --- | --- |
| [Quick Start](quick_start/index.md) | Local dev requirements, scripts, and scene controls |
| [Scene Details](details/index.md) | Architecture, component breakdown, and customization hooks |
| [Agent Rules](https://github.com/BA-CalderonMorales/immersive-awe-canvas/blob/main/agents/RULES.md) | Repository guardrails for AI collaborators |
