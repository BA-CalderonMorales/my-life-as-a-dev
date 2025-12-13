---
title: Docs-as-Code Workflow
description: How to preview, version, and deploy the site with repeatable commands.
---

# Docs-as-Code Workflow

1. **Write or edit Markdown.**
2. **Preview locally.** `make serve` or `./doc-cli.sh startup` for a quick build.
3. **Version with mike.** Cut docs releases using `doc-cli bump-version` when ready.
4. **Deploy.** `doc-cli deploy` or let GitHub Actions publish to GitHub Pages.

## Quick commands

- Local preview: `make serve`
- Baseline checks: `./doc-cli.sh startup`
- Build static site: `make build`
- Versioned release: `doc-cli bump-version && doc-cli deploy`
