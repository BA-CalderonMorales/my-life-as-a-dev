# AGENTS.md

Guidelines for AI assistants working on this repository. Detailed skills are in [.github/skills/](.github/skills/).

## Overview

This is an MkDocs Material documentation hub using Zensical as the primary static site generator. Key tools: `zensical`, `mkdocs`, `mike`, `doc-cli` (Rust).

## Critical Rules

### ALWAYS use `uv` for Python package management

**This is mandatory.** Never use `pip` directly. Always use `uv`:

```bash
# Installing packages
uv pip install <package>
uv pip install -r requirements.txt

# Listing packages
uv pip list

# Running Python commands through uv
uv run python <script.py>
uv run mkdocs serve
uv run zensical serve
```

The project uses a virtual environment at `.venv/`. All Python tools (zensical, mkdocs, etc.) are installed there.

## Quick Commands

```bash
make setup    # Install dependencies (uses uv)
make serve    # Start Zensical dev server
make build    # Build site with Zensical
doc-cli       # Interactive CLI (uses .venv automatically)
```

## Skills Index

### Documentation

| Skill | When to Use |
|-------|-------------|
| [Add Documentation Page](.github/skills/add-documentation-page/SKILL.md) | Adding any new page to the site |
| [Add Algorithm Problem](.github/skills/add-algorithm-problem/SKILL.md) | Adding practice problems to algorithm topics |
| [Add Algorithm Pattern](.github/skills/add-algorithm-pattern/SKILL.md) | Creating new algorithm pattern sections |
| [Add Project Documentation](.github/skills/add-project-documentation/SKILL.md) | Documenting new projects |
| [Update Navigation](.github/skills/update-navigation/SKILL.md) | Modifying mkdocs.yml nav structure |
| [Verify Navigation](.github/skills/verify-navigation/SKILL.md) | Check for missing nav entries before committing |
| [Refactor Large Pages](.github/skills/refactor-large-pages/SKILL.md) | Breaking up pages with embedded content |
| [Markdown Formatting](.github/skills/markdown-formatting/SKILL.md) | Formatting standards and patterns |

### Development

| Skill | When to Use |
|-------|-------------|
| [Build and Test](.github/skills/build-and-test/SKILL.md) | Building, serving, and validating docs |
| [Hot Reload Troubleshooting](.github/skills/hot-reload-troubleshooting/SKILL.md) | Fixing dev server hot reload issues |
| [Doc-CLI Usage](.github/skills/doc-cli-usage/SKILL.md) | Using the Rust CLI tool |
| [Testing](.github/skills/testing/SKILL.md) | Running Python and Rust tests |
| [Code Standards](.github/skills/code-standards/SKILL.md) | Python and Rust code style |

### Testing & Debugging

| Skill | When to Use |
|-------|-------------|
| [Agent Browser](.github/skills/agent-browser/SKILL.md) | Headless browser automation for visual testing |
| [Fix Console Errors](.github/skills/fix-console-errors/SKILL.md) | Debug browser console errors |

### Workflow

| Skill | When to Use |
|-------|-------------|
| [Git Workflow](.github/skills/git-workflow/SKILL.md) | Commits, branches, and PRs |
| [Encode Fix Intent](.github/skills/encode-fix-intent/SKILL.md) | Replace noisy comments with clearly named fix wrappers |
| [Version and Deploy](.github/skills/version-and-deploy/SKILL.md) | Releasing new versions |

### Security

| Skill | When to Use |
|-------|-------------|
| [AI Security](.github/skills/ai-security/SKILL.md) | Working with AI features (disabled in prod) |

### Cloud Services

| Skill | When to Use |
|-------|-------------|
| [Update Agent Flows](.github/skills/update-agent-flows/SKILL.md) | Adding/modifying ADK agents for chat widget |
| [Retrieve Cloud Source](.github/skills/retrieve-cloud-source/SKILL.md) | Fetching cloud resources |

## Core Rules

1. **ALWAYS use `uv`** for Python package management - never use `pip` directly
2. **No emojis** in commits, docs, or comments
3. **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`
4. **Always verify**: Run `make build` before committing
5. **Update nav**: ALL new pages must be added to `.nav.yml` - including problem sub-pages
6. **Check build output**: Look for "not included in nav" warnings - fix them before committing
7. **Test changes**: Use `make serve` to preview
8. **Use zensical.toml** as the primary configuration (not mkdocs.yml)
9. **No output truncation**: Show full command output - only truncate if explicitly asked

## Working with AI Assistants

- Think before editing; ask clarifying questions
- Keep changes small; follow existing patterns
- Test locally before considering work complete
- Reference skills for detailed procedures

---

For detailed procedures, see the skills in [.github/skills/](.github/skills/).