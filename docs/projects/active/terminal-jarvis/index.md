---
title: Terminal Jarvis
description: A unified command center that installs, updates, and runs 10+ AI coding assistants from one delightful terminal UI.
tags:
  - Project
  - Rust
  - AI
  - TypeScript
---

# Terminal Jarvis

> A unified command center that installs, updates, and runs 10+ AI coding assistants from one delightful terminal UI.

---

## Signal

!!! info "Project Signal"

    - **Status**: v0.0.74 (113 ⭐ • 16 forks) — bi-weekly to monthly updates
    - **Focus**: Orchestrating multi-vendor AI CLIs with one workflow
    - **Stack**: Rust core (85%), TypeScript wrapper, Shell scripts
    - **Ideal For**: Developers juggling multiple AI assistants across projects

## Quick Links

- [:fontawesome-brands-github: Repository](https://github.com/BA-CalderonMorales/terminal-jarvis)
- [:material-npm: NPM Package](https://www.npmjs.com/package/terminal-jarvis)
- [:material-language-rust: Crates.io](https://crates.io/crates/terminal-jarvis)
- [:fontawesome-brands-discord: Discord](https://discord.gg/WteQm6MTZW)

## Onboarding Checklist

1. Install via `npx terminal-jarvis` (no global install required) or use `npm install -g terminal-jarvis` if you prefer a dedicated binary.
2. Launch `terminal-jarvis`, choose a tool, and follow the built-in auth prompts for API keys or browser-based flows.
3. Customize `terminal-jarvis.toml` (optional) to pin themes, rename tools, or add aliases for your favorite workflows.

## Highlights

- Tool switcher supports **10 AI coding tools**: Claude, Gemini, Qwen, Goose, Amp, Aider, OpenCode, LLXprt, Codex, and Crush — with 12+ more tracked for future integration.
- Smart authentication system remembers sessions, detects browser logins, and handles headless/CI environments gracefully.
- Beautiful T.JARVIS interface with ASCII art, live status dashboard, and theme toggles (T.JARVIS/Classic/Matrix).
- Update workflow keeps every CLI current via `terminal-jarvis update` and surfaces release notes inline.

## Core Scenarios

- **Daily driver**: Keep multiple AI CLIs ready without memorizing each command set.
- **Team enablement**: Ship a single onboarding script that installs Jarvis plus shared configuration.
- **Experimentation**: Quickly try newer tools (e.g., LLXprt, Crush) while still running stable favorites.

## Documentation

| Guide | Description |
| :---- | :---------- |
| [Installation](quick_start/installation.md) | Platform-specific requirements, package managers, and troubleshooting |
| [Usage](quick_start/usage.md) | Interactive mode, direct commands, keyboard shortcuts, and automation tips |
| [Configuration](quick_start/configuration.md) | TOML settings, theme customization, and tool overrides |
| [AI Tools](quick_start/ai-tools.md) | Auth flows, feature matrix, and provider-specific notes |
