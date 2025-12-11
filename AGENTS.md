# AGENTS.md

Guidelines for AI assistants working on this repository. Short, actionable, and focused on process, tooling, and security.

## Overview
This repository is an MkDocs Material-based documentation hub. Key tools: `mkdocs`, `mike`, `doc-cli` (Rust), and a local `mkdocs_plugins` package. AI features exist but are disabled in production.

## Quick Commands
- `make setup` — install dependencies and register local plugin
- `make serve` — start dev server (PYTHONPATH must be set when running directly)
- `make build` — build static site
- `doc-cli` — Rust CLI for repo tasks (startup, bump-version, deploy)

## Commit & PRs
- Use Conventional Commits (feat:, fix:, chore:).
- PR prefixes: Feature/Bugfix/Cleanup/Pipeline → `develop`; Hotfix → `main`.
- Include a short CI checklist in PRs (install, build, typecheck, test).

## CI & Releases
- CI uses `make setup`/`make build`. GitHub Actions handles versioned deploys to GitHub Pages via `mike`.

## Code Standards (short)
- No emojis in commits, docs, or comments.
- Python 3.10+; prefer small, pure functions, type hints, and PEP 8.
- Rust: `cargo fmt`, `cargo clippy`; meaningful errors.
- Naming: `snake_case` for functions/files, `PascalCase` for types, `UPPER_SNAKE_CASE` for constants.
- Prefer self-documenting code; use docstrings for public APIs.

## Working with AI Assistants
- Think before editing, ask clarifying questions, and test changes locally.
- Keep changes small; follow existing patterns; explain trade-offs.

## AI Features & Security
- AI proxy (scripts/python/ai_proxy.py) and plugin (mkdocs_plugins/ai_plugin.py) exist but are disabled in production.
- DO NOT expose tokens in client-side code. Implement auth, logging, rate-limiting, and filtering before enabling.

## Project Notes
- Custom plugins: `mkdocs_plugins/` (install with `pip install -e .`).
- Versions via `mike` and git tags; `doc-cli` simplifies common tasks.

## Testing
- Use `pytest` for Python, `cargo test` for Rust; write tests for behavior, not internals.

## Minimal Expectations
- Run `make setup` before working; keep docs updated and PR-friendly; follow security guidelines for AI features.

---
If a specific workflow detail is needed, check `mkdocs.yml`, `mkdocs_plugins/`, or `scripts/` for authoritative behavior.