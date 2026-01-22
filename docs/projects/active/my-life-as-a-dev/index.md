---
title: Docs-as-Code Portfolio
description: The MkDocs Material + Zensical system that powers this entire site, complete with AI-aware plugins and versioned releases.
tags:
  - Project
  - Documentation
  - Python
  - AI
---

# Docs-as-Code Portfolio

> The MkDocs Material + Zensical system that powers this entire site, complete with AI-aware plugins and versioned releases.

---

## Signal

!!! info "Project Signal"

	- **Status**: Actively maintained with weekly content drops
	- **Focus**: Central knowledge base, MkDocs experiments, AI-assisted docs
	- **Stack**: MkDocs Material, mike, Zensical, custom plugins, uv-managed Python
	- **Ideal For**: Developers building narrative docs sites with repeatable releases

## Quick Links

- [:fontawesome-brands-github: Repository](https://github.com/BA-CalderonMorales/my-life-as-a-dev)
- [Live Site](https://ba-calderonmorales.github.io/my-life-as-a-dev/)
- [Quick Start](quick_start/index.md)
- [Details Hub](details/index.md)

## Onboarding Checklist

1. Clone the repository and run `make setup` (uses `uv` to install everything inside `.venv/`).
2. Start local docs with `make serve` or `uv run zensical serve` to preview changes.
3. Before pushing, run `make build` to validate MkDocs + Zensical output and catch nav drift.

## Highlights

- AI-powered chat widget integrated via Cloud Run + Gemini API for interactive site navigation.
- mike-backed versioning so each release of the site is reproducible and deployable via `mike deploy`.
- Opinionated `AGENTS.md` + `.github/skills/` directory that codifies how contributors and AI agents collaborate.

## Core Scenarios

- **Personal knowledge hub**: Publish essays, project docs, and learning tracks with a unified layout.
- **Docs-as-code template**: Reuse the structure for other MkDocs Material deployments with CI-ready Make targets.
- **AI experimentation**: Toggle local AI helpers on/off through environment variables without touching prod builds.

## Documentation Map

<div class="grid cards" markdown>

-   :material-rocket-launch:{ .lg .middle } **Quick Start**

	---

	Environment setup, serving docs locally, and build verification steps.

	[Open Guide](quick_start/index.md)

-   :material-file-tree:{ .lg .middle } **Details**

	---

	Architecture, plugin internals, deployment flow, and contribution standards.

	[Explore Details](details/index.md)

-   :material-shield-check:{ .lg .middle } **Workflow Skills**

	---

	Hands-on guides for versioning, releases, and day-to-day workflow.

	[Review Playbooks](../../docs-as-code/workflow/index.md)

</div>
