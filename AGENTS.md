# AGENTS.md - My Life as a Dev

## Quick Reference

- **Generator**: Zensical (MkDocs Material-based)
- **Serve**: `make serve`
- **Build**: `make build`
- **Viewport Check**: `make viewport-check`
- **CLI**: `doc-cli`

## Critical Rules

- **ALWAYS use `uv`** for Python - never `pip` directly
- **ALWAYS use repo Playwright tests through `uv`** for browser automation - never Playwright MCP
- **Do not use `agent-browser`** unless explicitly requested; prefer `make viewport-check`, `make screenshots`, and `make accessibility-check`
- **No emojis** in commits, docs, or comments

## Quick Commands

```bash
make setup    # Install dependencies (uses uv)
make serve    # Start Zensical dev server
make build    # Build site with Zensical
make viewport-check  # Run Playwright responsive layout checks
make screenshots     # Capture Playwright screenshots across viewports
doc-cli       # Interactive CLI (uses .venv automatically)
```

## Browser Automation

```bash
make browser-install       # Install Playwright Chromium
make viewport-check        # Validate responsive layout
make screenshots           # Capture mobile/tablet/desktop screenshots
make accessibility-check   # Run axe-backed accessibility checks
```

## Core Rules

1. ALWAYS use `uv` for Python package management
2. No emojis in commits, docs, or comments
3. Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`
4. Always verify: Run `make build` before committing
5. Update nav: ALL new pages must be added to `.nav.yml`
6. Check build output: Fix "not included in nav" warnings
7. Test changes: Use `make serve` to preview
8. Use `zensical.toml` as primary config (not mkdocs.yml)
9. No output truncation: Show full command output
10. Browser automation uses repo Playwright tests via `uv`, not Playwright MCP

## Skills

See `.github/skills/` for detailed procedures:
- `add-documentation-page/` - Adding new pages
- `add-algorithm-problem/` - Adding algorithm problems
- `build-and-test/` - Building and validating
- `browser-automation/` - Browser automation with Playwright through uv
- `git-workflow/` - Commits and PRs
- `site-fix-tdd-bdd/` - Fixing site regressions with TDD/BDD-style coverage

## Working Rules

- Stop and explain before major architectural changes
- One change per commit, commit before starting next
- Do not bundle unrelated work into the same commit
