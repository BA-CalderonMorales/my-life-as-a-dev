# AGENTS.md - My Life as a Dev

## Current Shape

- **Generator**: Zensical (MkDocs Material-based)
- **Content**: Developer journey, learning notes, platform experiments, docs-as-code workflows
- **Structure**: `docs/` contains published content, `config/zensical/` has modular config, `scripts/` has Rust CLI and Python helpers
- **Deploy**: GitHub Pages via `make build` → `gh-pages` branch

## Branch Strategy

- **`develop`**: default base for PRs. Experimentation and quick iteration.
- **`main`**: tagged releases only. PRs merge into `develop` first, then
  `develop` fast-forwards into `main` at release time.
- **Feature branches**: branch from `develop`, PR against `develop`.

## Quick Commands

```bash
make setup    # Install dependencies (uses uv)
make serve    # Start Zensical dev server
make build    # Build site with Zensical
doc-cli       # Interactive CLI (uses .venv automatically)
```

## Critical Rules

- **ALWAYS use `uv`** for Python - never `pip` directly
- **ALWAYS use `agent-browser`** for browser automation - never Playwright MCP
- **No emojis** in commits, docs, or comments

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

## GitNexus — Code Intelligence

This project is indexed by GitNexus as **my-life-as-a-dev** (4151 symbols, 6382 relationships, 159 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

### Quick Commands

```bash
make gn-analyze    # Re-index the codebase
make gn-status     # Check index freshness
make gn-clean      # Delete the index
```

### Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

### Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

### Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/my-life-as-a-dev/context` | Codebase overview, check index freshness |
| `gitnexus://repo/my-life-as-a-dev/clusters` | All functional areas |
| `gitnexus://repo/my-life-as-a-dev/processes` | All execution flows |
| `gitnexus://repo/my-life-as-a-dev/process/{name}` | Step-by-step execution trace |

### Skill References

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
