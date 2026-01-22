---
title: Docs-as-Code Stack
description: The tools that power the site and how they fit together.
hide:
  - toc
---

# Docs-as-Code Stack

- **MkDocs + Material for MkDocs** for accessible, fast pages with strong navigation.
- **mike** to publish versioned documentation without losing history.
- **GitHub Actions** to build and deploy to GitHub Pages after meaningful changes.
- **Custom Rust doc-cli** to streamline setup, version bumping, and deployments.

## How it fits together

1. Author content in Markdown.
2. Preview locally with MkDocs.
3. Use mike for versioning and aliases.
4. Deploy via GitHub Actions to GitHub Pages.
