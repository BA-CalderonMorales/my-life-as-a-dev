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

## Core Scenarios

- **Creative prototyping**: Quickly concept ambient hero sections or marketing visuals inside a browser.
- **Design handoff**: Share Lovable-hosted builds so designers can tweak parameters before exporting captures.
- **Agent workflows**: Use consistent RULES/MEMORY files to script GitHub Copilot-style agents inside the repo.

## Documentation Map

<div class="grid cards" markdown>

-   :material-play-circle:{ .lg .middle } **Quick Start**

	---

	Local dev requirements, scripts, and scene controls.

	[Open Guide](quick_start/index.md)

-   :material-cube:{ .lg .middle } **Scene Details**

	---

	Architecture, component breakdown, and customization hooks.

	[Explore Details](details/index.md)

-   :material-shield-check:{ .lg .middle } **Agent Rules**

	---

	Repository guardrails for AI collaborators.

	[View RULES](https://github.com/BA-CalderonMorales/immersive-awe-canvas/blob/main/agents/RULES.md)

</div>
