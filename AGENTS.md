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


<!-- headroom:rtk-instructions -->
# RTK (Rust Token Killer) - Token-Optimized Commands

When running shell commands, **always prefix with `rtk`**. This reduces context
usage by 60-90% with zero behavior change. If rtk has no filter for a command,
it passes through unchanged — so it is always safe to use.

## Key Commands
```bash
# Git (59-80% savings)
rtk git status          rtk git diff            rtk git log

# Files & Search (60-75% savings)
rtk ls <path>           rtk read <file>         rtk grep <pattern>
rtk find <pattern>      rtk diff <file>

# Test (90-99% savings) — shows failures only
rtk pytest tests/       rtk cargo test          rtk test <cmd>

# Build & Lint (80-90% savings) — shows errors only
rtk tsc                 rtk lint                rtk cargo build
rtk prettier --check    rtk mypy                rtk ruff check

# Analysis (70-90% savings)
rtk err <cmd>           rtk log <file>          rtk json <file>
rtk summary <cmd>       rtk deps                rtk env

# GitHub (26-87% savings)
rtk gh pr view <n>      rtk gh run list         rtk gh issue list

# Infrastructure (85% savings)
rtk docker ps           rtk kubectl get         rtk docker logs <c>

# Package managers (70-90% savings)
rtk pip list            rtk pnpm install        rtk npm run <script>
```

## Rules
- In command chains, prefix each segment: `rtk git add . && rtk git commit -m "msg"`
- For debugging, use raw command without rtk prefix
- `rtk proxy <cmd>` runs command without filtering but tracks usage
<!-- /headroom:rtk-instructions -->
