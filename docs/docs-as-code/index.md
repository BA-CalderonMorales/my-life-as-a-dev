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

## Release loop

1. Edit Markdown and supporting assets in `docs/`.
2. Preview locally with `make serve` or `./doc-cli serve`.
3. Run `make build` before pushing changes.
4. Open a pull request with Conventional Commit history.
5. Publish a version with `./doc-cli deploy` when the change is ready for release.
