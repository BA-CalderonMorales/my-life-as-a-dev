---
tags:
  - Documentation
  - DevOps
  - Workflow
comments: true
---

# Docs-as-Code Platform

This site treats documentation like any other product release: versioned, automated, and written with intent. Everything you see is built with MkDocs Material, backed by mike for versioning, and shipped through GitHub Actions.

---

## Sections

<div class="grid cards" markdown>

-   :material-compass-outline:{ .lg .middle } **Guiding Principles**

    ---

    Navigation, safety, and maintainability rules.

    [:octicons-arrow-right-24: Open Principles](principles/index.md)

-   :material-call-split:{ .lg .middle } **Workflow**

    ---

    Preview, version, and deploy steps.

    [:octicons-arrow-right-24: Open Workflow](workflow/index.md)

-   :material-layers-triple:{ .lg .middle } **Stack & Tooling**

    ---

    MkDocs, mike, Actions, doc-cli overview.

    [:octicons-arrow-right-24: Open Stack](stack/index.md)

-   :material-check-decagram:{ .lg .middle } **Quality & Style**

    ---

    Writing conventions and consistency.

    [:octicons-arrow-right-24: Open Guide](quality/index.md)

-   :material-shield-lock-outline:{ .lg .middle } **AI & Security**

    ---

    Preconditions before enabling AI features.

    [:octicons-arrow-right-24: Open AI Stance](ai_security/index.md)

</div>

---

## Principles that guide the site

- Docs live with code. Every page is in Git, peer reviewed, and versioned alongside the tooling that renders it.
- Pipelines stay readable. Build and deploy steps are short, explicit, and easy to troubleshoot.
- Navigation mirrors reality. Pages are organized by purpose so readers do not have to guess where to look.
- Security is deliberate. Nothing experimental ships without a clear plan for authentication, logging, and rate limits.

---

## Technology stack

- **MkDocs + Material for MkDocs** for fast, accessible pages with strong navigation.
- **Mike** to publish versioned documentation without losing history.
- **GitHub Actions** to build and deploy to GitHub Pages after every meaningful change.
- **Custom Rust CLI (doc-cli)** to streamline local setup, version bumping, and deployments.

---

## How the workflow fits together

1. Write or edit Markdown.
2. Run `make serve` or `doc-cli startup` to view changes locally.
3. Open a pull request with Conventional Commit history.
4. GitHub Actions builds the site with mike and deploys to Pages.
