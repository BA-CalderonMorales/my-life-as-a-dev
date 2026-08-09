# AGENTS.md - My Life as a Dev

## Current Shape

- Zensical (MkDocs Material) site: `docs/` is published content,
  `docs-archive/` holds retired long-form documentation, and
  `config/zensical/*.toml` is the modular config merged into `zensical.toml`.
- `scripts/` holds local automation: `scripts/python/` for site tooling
  (config merge, canvas generation), `scripts/rust/` for checks like nav
  validation; `doc-cli` (via `doc-cli.sh`) is the interactive front door.
- `e2e/` holds the Playwright suite (viewport, quality, accessibility) run
  through `uv`; `tests/` holds unit and mutation coverage.
- `.github/skills/` is the procedure library agents execute from
  (`add-documentation-page`, `browser-automation`, `site-fix-tdd-bdd`,
  `git-workflow`, ...).
- Deploy: GitHub Pages via `make build` -> `gh-pages` branch.
- Pre-rewrite leftovers are pruned; use Git history for legacy reference.

## Key Sections

| To understand... | Read |
|---|---|
| Site generation and build workflow | `README.md`, Makefile targets |
| Navigation and page metadata | `config/zensical/03-navigation.toml` |
| Adding or editing pages | `.github/skills/add-documentation-page/SKILL.md` |
| Browser automation (Playwright via uv) | `.github/skills/browser-automation/SKILL.md`, `e2e/` |
| Site fixes with TDD/BDD coverage | `.github/skills/site-fix-tdd-bdd/SKILL.md` |
| Git flow, commits, and PRs | `.github/skills/git-workflow/SKILL.md`, `CONTRIBUTING.md` |
| Build and validate every change | `.github/skills/build-and-test/SKILL.md` |
| Everything else | `CHANGELOG.md`, then this file again |

Lost in the woods? Start with `README.md` for *why*, then
`.github/skills/build-and-test/SKILL.md` for *how* a change lands.

## Run

```bash
make setup              # uv-based install
make serve              # Zensical dev server on :8001
make build              # build the site
make viewport-check     # Playwright layout checks
make screenshots        # viewport captures
make accessibility-check # axe-backed checks
doc-cli                 # interactive doc tooling
```

## Branch Strategy

- `develop`: default base for PRs; experimentation and fast iteration.
- `main`: tagged releases only - `develop` fast-forwards into `main` at
  release time.
- `gh-pages` is the deploy target only; never open PRs against it.
- Feature branches branch from `develop` and PR against `develop`.

## CI

- `github_pages.yml` builds and deploys the site; `security-scan.yml` gates
  pushes and PRs. Both skip docs-adjacent paths or support
  `workflow_dispatch` when a run is needed.

## Rules

- ALWAYS use `uv` for Python - never `pip`; keep `uv.lock` in sync.
- Browser automation ONLY through repo Playwright tests via `uv` - never
  Playwright MCP; never use `agent-browser` unless explicitly requested.
- No emojis in commits, docs, or comments.
- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`.
- Verify before committing: `make build`; fix every "not included in nav"
  warning.
- New pages must be registered in `config/zensical/03-navigation.toml`
  (via `config/zensical/` modular files), not `.nav.yml`.
- One change per commit; stop and explain before major architectural
  changes; never bundle unrelated work.

## Design Principles

- **SRP** - one page = one topic; one skill = one procedure.
- **OCP** - extend by adding a page or skill, never by widening an existing
  one.
- **DRY** - one authoritative home per piece of knowledge: modular TOML
  sources merge into `zensical.toml`; nav lives in one config, not scattered.
- **KISS** - boring beats novel; delete before adding.
- **POLA** - behavior must not astonish: builds fail loudly on nav drift;
  screenshots regenerate from the same Playwright suite.
- **CQS** - `make serve` preview is read-only; `make build` writes `site/`;
  deploys happen only through `github_pages.yml`.
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
| Understand architecture / "How does X work?" | `.agents/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.agents/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.agents/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.agents/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.agents/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.agents/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
