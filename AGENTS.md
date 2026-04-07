# AGENTS.md - My Life as a Dev

## Quick Reference

- **Generator**: Zensical (MkDocs Material-based)
- **Serve**: `make serve`
- **Build**: `make build`
- **CLI**: `doc-cli`

## Critical Rules

- **ALWAYS use `uv`** for Python - never `pip` directly
- **ALWAYS use `agent-browser`** for browser automation - never Playwright MCP
- **No emojis** in commits, docs, or comments

## Quick Commands

```bash
make setup    # Install dependencies (uses uv)
make serve    # Start Zensical dev server
make build    # Build site with Zensical
doc-cli       # Interactive CLI (uses .venv automatically)
```

## Agent Browser

```bash
cd /tmp/agent-browser
./bin/agent-browser open "http://localhost:8001/my-life-as-a-dev/"
./bin/agent-browser snapshot
./bin/agent-browser eval "..."
./bin/agent-browser console
./bin/agent-browser close
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

## Skills

See `.github/skills/` for detailed procedures:
- `add-documentation-page/` - Adding new pages
- `add-algorithm-problem/` - Adding algorithm problems
- `build-and-test/` - Building and validating
- `agent-browser/` - Browser automation
- `git-workflow/` - Commits and PRs

## Working Rules

- Stop and explain before major architectural changes
- One change per commit, commit before starting next
- Do not bundle unrelated work into the same commit
