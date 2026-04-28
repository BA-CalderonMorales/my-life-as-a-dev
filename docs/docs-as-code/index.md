---
tags:
  - Documentation
  - DevOps
  - Workflow
comments: true
---

# Docs-as-Code Platform

This site treats documentation like release infrastructure. Content lives in Git, builds with Zensical, renders through the Material theme, versions with mike, and ships through GitHub Actions.

---

## Sections

<div class="grid cards" markdown>

-   :material-compass-outline:{ .lg .middle } **Guiding Principles**

    ---

    Navigation, maintainability, and content rules that keep the site coherent.

    [:octicons-arrow-right-24: Open Principles](principles/index.md)

-   :material-call-split:{ .lg .middle } **Workflow**

    ---

    Local preview, release flow, and versioning steps.

    [:octicons-arrow-right-24: Open Workflow](workflow/index.md)

-   :material-layers-triple:{ .lg .middle } **Stack & Tooling**

    ---

    Zensical, Material, mike, and the supporting CLI workflow.

    [:octicons-arrow-right-24: Open Stack](stack/index.md)

-   :material-check-decagram:{ .lg .middle } **Quality & Style**

    ---

    Writing standards, review habits, and consistency checks.

    [:octicons-arrow-right-24: Open Guide](quality/index.md)

-   :material-robot-outline:{ .lg .middle } **AI Integrations**

    ---

    Chat widget architecture, deployment, and integration constraints.

    [:octicons-arrow-right-24: Open AI Guides](ai/index.md)

-   :material-shield-lock-outline:{ .lg .middle } **Security Controls**

    ---

    Preconditions, safeguards, and operational boundaries for AI features.

    [:octicons-arrow-right-24: Open Security](security/index.md)

</div>

---

## The Pipeline

<div class="mlad-stack" markdown>

<div class="mlad-stack__node" markdown>
<div class="mlad-stack__node-icon">:material-file-document-outline:</div>
<div class="mlad-stack__node-label">Markdown</div>
<div class="mlad-stack__node-desc">Content + metadata</div>
</div>

<div class="mlad-stack__arrow" aria-hidden="true">→</div>

<div class="mlad-stack__node" markdown>
<div class="mlad-stack__node-icon">:material-cog-outline:</div>
<div class="mlad-stack__node-label">Zensical</div>
<div class="mlad-stack__node-desc">Config merge + build</div>
</div>

<div class="mlad-stack__arrow" aria-hidden="true">→</div>

<div class="mlad-stack__node" markdown>
<div class="mlad-stack__node-icon">:material-palette-outline:</div>
<div class="mlad-stack__node-label">MkDocs</div>
<div class="mlad-stack__node-desc">Render + theme</div>
</div>

<div class="mlad-stack__arrow" aria-hidden="true">→</div>

<div class="mlad-stack__node" markdown>
<div class="mlad-stack__node-icon">:material-robot-outline:</div>
<div class="mlad-stack__node-label">GitHub Actions</div>
<div class="mlad-stack__node-desc">CI + deploy</div>
</div>

<div class="mlad-stack__arrow" aria-hidden="true">→</div>

<div class="mlad-stack__node" markdown>
<div class="mlad-stack__node-icon">:material-earth:</div>
<div class="mlad-stack__node-label">GitHub Pages</div>
<div class="mlad-stack__node-desc">Hosted site</div>
</div>

</div>

---

## Operating rules

- Docs stay in the repository with the code they explain.
- Build and release steps stay short enough to understand without tribal knowledge.
- Navigation reflects how people actually look for information, not just how files were created.
- AI features only ship with explicit guardrails for logging, authentication, and abuse handling.

---

## Current toolchain

- **Zensical** is the primary build and local development path.
- **Material for MkDocs** provides the theme, navigation model, and content components.
- **Mike** preserves versioned releases without overwriting history.
- **GitHub Actions** builds and deploys published versions to GitHub Pages.
- **`doc-cli`** wraps common development and release tasks for local use.

---

## Recent Changes

<div class="mlad-changelog" markdown>

<div class="mlad-changelog__entry" markdown>
<div class="mlad-changelog__date">2026-04-28</div>
<div class="mlad-changelog__content" markdown>
**High Contrast Minimalism V3** — Complete visual refresh: pure black/white palette, scroll-driven vines, animated 404, editorial timeline resume, and awwwards-level motion design.
</div>
</div>

<div class="mlad-changelog__entry" markdown>
<div class="mlad-changelog__date">2026-04-06</div>
<div class="mlad-changelog__content" markdown>
**Elemental Ink V2** — Migrated from monumental minimalism to ATLA-inspired earth tones: teal accents, warm surfaces, flat hierarchy.
</div>
</div>

<div class="mlad-changelog__entry" markdown>
<div class="mlad-changelog__date">2026-03-01</div>
<div class="mlad-changelog__content" markdown>
**Zensical Migration** — Merged modular TOML config, added version selector, image optimizer with LQIP, and automated deployment pipeline.
</div>
</div>

</div>

---

## Release loop

1. Edit Markdown and supporting assets in `docs/`.
2. Preview locally with `make serve` or `./doc-cli serve`.
3. Run `make build` before pushing changes.
4. Open a pull request with Conventional Commit history.
5. Publish a version with `./doc-cli deploy` when the change is ready for release.
