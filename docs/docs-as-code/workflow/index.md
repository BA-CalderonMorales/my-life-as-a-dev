---
title: Docs-as-Code Workflow
description: How to preview, build, and deploy the site with repeatable commands.
tags:
  - Workflow
  - DevOps
  - Documentation
comments: true
---

# Docs-as-Code Workflow

1. **Write or edit Markdown.**
2. **Preview locally.** `make serve` starts the Zensical dev server.
3. **Build.** `make build` compiles the site to `site/`.
4. **Deploy.** Trigger the GitHub Actions workflow or run `./doc-cli.sh deploy <version> --push`.

For versioning details, see [Versioning](versioning.md).

---

## Quick commands

| Task | Command |
|------|---------|
| Local preview | `make serve` |
| Build site | `make build` |
| Deploy version | `./doc-cli.sh deploy 0.4.0 --push` |
| List versions | `uv run python scripts/python/versioned_deploy.py list` |

---

## CI behavior

- **Push to main**: Builds and validates the site. No deployment.
- **Pull request**: Builds and runs structure tests.
- **Workflow dispatch**: Deploys the specified version to GitHub Pages.

To deploy, go to **Actions > Build and Deploy Docs > Run workflow** and enter the version number.

---

## Why we use a custom versioning script

Zensical does not yet support versioning natively. The team has it on their [roadmap](https://github.com/zensical/backlog/issues/45) with plans for both directory-based and git-based versioning.

Until then, we use `versioned_deploy.py` to provide mike-style versioned deployments. This script:

- Builds with Zensical
- Copies output to versioned directories on `gh-pages`
- Maintains `versions.json` for the version selector
- Handles the `latest` alias

When Zensical ships native versioning, we can migrate to their approach.
