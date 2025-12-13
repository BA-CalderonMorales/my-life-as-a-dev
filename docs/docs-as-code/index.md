# Docs-as-Code Platform

This site treats documentation like any other product release: versioned, automated, and written with intent. Everything you see is built with MkDocs Material, backed by mike for versioning, and shipped through GitHub Actions.

<div class="grid cards" markdown>

-   :material-compass-outline:{ .lg .middle } **Guiding Principles**

    ---

    The rules that keep structure, navigation, and safety consistent.

    [Review the principles](#principles-that-guide-the-site)

-   :material-laptop:{ .lg .middle } **Local Workflow**

    ---

    Commands for previewing, versioning, and deploying the site.

    [Follow the workflow](#how-the-workflow-fits-together)

-   :material-cube-outline:{ .lg .middle } **Stack & Tooling**

    ---

    MkDocs Material, mike, GitHub Actions, and the Rust doc-cli that ties them together.

    [See the stack](#technology-stack)

-   :material-shield-check-outline:{ .lg .middle } **Quality & Style**

    ---

    Writing conventions and design cues that keep the docs readable.

    [Apply the rules](#quality-and-style)

-   :material-robot-off-outline:{ .lg .middle } **AI & Security Posture**

    ---

    What must be true before enabling any AI features publicly.

    [Read the stance](#ai-and-security-stance)

</div>

## Principles that guide the site

- **Docs live with code.** Every page is in Git, peer reviewed, and versioned alongside the tooling that renders it.
- **Pipelines stay readable.** Build and deploy steps are short, explicit, and easy to troubleshoot.
- **Navigation mirrors reality.** Pages are organized by purpose so readers do not have to guess where to look.
- **Security is deliberate.** Nothing experimental ships without a clear plan for authentication, logging, and rate limits.

## Technology stack

- **MkDocs + Material for MkDocs** for fast, accessible pages with strong navigation.
- **Mike** to publish versioned documentation without losing history.
- **GitHub Actions** to build and deploy to GitHub Pages after every meaningful change.
- **Custom Rust CLI (`doc-cli`)** to streamline local setup, version bumping, and deployments.

## How the workflow fits together

1. Write or edit Markdown.
2. Run `make serve` or `doc-cli startup` to view changes locally.
3. Open a pull request with Conventional Commit history.
4. GitHub Actions builds the site with mike and deploys to Pages.

The same checklist applies for new versions:

```bash
# Start a local preview
make serve

# Create a new version when ready
doc-cli bump-version

doc-cli deploy
```

## Quality and style

- Keep paragraphs short and purposeful; this site favors readability over marketing fluff.
- Prefer Roboto for text and Roboto Mono for code to keep typography consistent across the app.
- Use Material icons (`:material-*:`) when a visual cue genuinely helps.
- Avoid comments in code blocks—keep examples self-explanatory.

## AI and security stance

AI chat hooks exist in the codebase but are intentionally disabled. Before enabling them we will require secure proxy hosting, proper authentication, rate limits, and observable logging. The checklist lives in `AGENTS.md` and will be followed before any public release.

## Why this site matters

The goal is to demonstrate a professional docs-as-code posture that others can emulate: opinionated styling, clear navigation, and release automation that does not surprise maintainers. If you spot a place where the structure could be clearer, open an issue and let us improve it together.
