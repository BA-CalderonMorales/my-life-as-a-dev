# AGENTS.md

Guidelines for AI assistants working on this repository. Detailed skills are in [.github/skills/](.github/skills/).

## Overview

This is an MkDocs Material documentation hub. Key tools: `mkdocs`, `mike`, `doc-cli` (Rust), and local `mkdocs_plugins`.

## Quick Commands

```bash
make setup    # Install dependencies
make serve    # Start dev server
make build    # Build site
doc-cli       # Interactive CLI
```

## Skills Index

### Documentation

| Skill | When to Use |
|-------|-------------|
| [Add Documentation Page](.github/skills/add-documentation-page.md) | Adding any new page to the site |
| [Add Algorithm Problem](.github/skills/add-algorithm-problem.md) | Adding practice problems to algorithm topics |
| [Add Algorithm Pattern](.github/skills/add-algorithm-pattern.md) | Creating new algorithm pattern sections |
| [Add Project Documentation](.github/skills/add-project-documentation.md) | Documenting new projects |
| [Update Navigation](.github/skills/update-navigation.md) | Modifying mkdocs.yml nav structure |
| [Verify Navigation](.github/skills/verify-navigation.md) | Check for missing nav entries before committing |
| [Refactor Large Pages](.github/skills/refactor-large-pages.md) | Breaking up pages with embedded content |
| [Markdown Formatting](.github/skills/markdown-formatting.md) | Formatting standards and patterns |

### Development

| Skill | When to Use |
|-------|-------------|
| [Build and Test](.github/skills/build-and-test.md) | Building, serving, and validating docs |
| [Doc-CLI Usage](.github/skills/doc-cli-usage.md) | Using the Rust CLI tool |
| [Testing](.github/skills/testing.md) | Running Python and Rust tests |
| [Code Standards](.github/skills/code-standards.md) | Python and Rust code style |

### Workflow

| Skill | When to Use |
|-------|-------------|
| [Git Workflow](.github/skills/git-workflow.md) | Commits, branches, and PRs |
| [Version and Deploy](.github/skills/version-and-deploy.md) | Releasing new versions |

### Security

| Skill | When to Use |
|-------|-------------|
| [AI Security](.github/skills/ai-security.md) | Working with AI features (disabled in prod) |

## Core Rules

1. **No emojis** in commits, docs, or comments
2. **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`
3. **Always verify**: Run `make build` before committing
4. **Update nav**: ALL new pages must be added to `mkdocs.yml` - including problem sub-pages
5. **Check build output**: Look for "not included in nav" warnings - fix them before committing
6. **Test changes**: Use `make serve` to preview

## Working with AI Assistants

- Think before editing; ask clarifying questions
- Keep changes small; follow existing patterns
- Test locally before considering work complete
- Reference skills for detailed procedures

---

For detailed procedures, see the skills in [.github/skills/](.github/skills/).