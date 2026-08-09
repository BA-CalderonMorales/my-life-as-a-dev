---
name: site-fix-tdd-bdd
description: Use when fixing My Life as a Dev site regressions, especially navbar/header styling, responsive layout, visual polish, chat widget behavior, version selector issues, generated Zensical output, or any production UI bug where the fix should be driven by TDD/BDD-style evidence. Guides Codex to reproduce first, encode the expected behavior with unit, mutation-regression, integration, and browser e2e checks, patch narrowly, build, deploy, and verify the live site.
---

# Site Fix TDD/BDD

Fix site defects by converting the user-visible complaint into executable expectations before or alongside the patch. Prefer small, specific tests that preserve the intended behavior and make future iteration cheap.

## Core Loop

1. **Reproduce the defect**
   - Capture the current behavior with local build/server output, screenshots, DOM metrics, network logs, or generated files.
   - For visual issues, inspect the rendered page with repo Playwright through `uv`; do not use Playwright MCP.
   - Record the concrete bad state: selector, geometry, color, response status/body, asset URL, or generated config line.

2. **State the expected behavior**
   - Translate the bug into BDD-style assertions: “logo and title share a centered row,” “header and tabs use one background,” “bad NVIDIA output returns non-OK so fallback can recover.”
   - Keep assertions observable from files, DOM, CSS computed styles, HTTP responses, or logs.

3. **Add regression coverage**
   - Unit/static tests: verify source contracts such as CSS selectors, config values, template order, or helper functions.
   - Mutation-regression tests: guard the exact dangerous edit that caused or could reintroduce the bug. These are normal tests named under `tests/mutation/`, not necessarily a mutation-testing framework.
   - Integration tests: verify generated config/templates/assets are wired together after `make build`.
   - Browser e2e tests: verify rendered behavior with Playwright for layout, visibility, colors, responsive breakpoints, and interaction.
   - If a layer cannot run locally, make the test skip with a precise reason rather than silently passing weak coverage.

4. **Patch narrowly**
   - Change the smallest CSS, template, JS, config, or service code needed.
   - Preserve Zensical/Material conventions unless the repo already overrides them intentionally.
   - Avoid broad visual rewrites, new design systems, or unrelated refactors while fixing a regression.

5. **Verify locally**
   - Always run `make build` before committing.
   - Run the new focused test set.
   - For visual changes, capture or inspect screenshots at desktop and mobile widths.
   - Use `make viewport-check` when the blast radius touches responsive layout broadly.

6. **Deploy and confirm**
   - Commit with a conventional commit message.
   - Push `main` only when requested or clearly part of the task.
   - Confirm GitHub Actions status with `gh run list/view/watch`.
   - Verify the live `latest` and new versioned asset paths with `curl`; account for GitHub Pages CDN cache.

## Test Placement

- `tests/test_<area>.py`: unit/static source contract tests.
- `tests/mutation/test_<area>_regressions.py`: mutation-style guards for known bad edits or boundary conditions.
- `tests/test_<area>_integration.py`: generated config/template/asset linkage checks.
- `e2e/quality/test_<area>.py`: browser-visible behavior, geometry, CORS/network, or UI interactions.

## Visual Regression Pattern

For layout or styling defects:

1. Use Playwright to gather actual metrics:
   - bounding boxes for relevant elements
   - computed colors and font sizes
   - visibility and overflow
   - screenshots for human inspection
2. Write browser assertions against stable relationships:
   - centers align within a small tolerance
   - element is inside parent bounds
   - two surfaces share the same computed background
   - text is visible and not clipped
3. Avoid brittle pixel-perfect assertions unless the component has fixed dimensions by design.

## Deployment Notes

- `make build` regenerates `zensical.toml`; include it when the source config changes.
- The GitHub Pages workflow auto-deploys the next patch version on push to `main`.
- Live `versions.json`, `latest`, and root assets can be cached. Verify the new numbered version path when cache behavior is unclear.
