---
title: Terminal Screensaver
description: A Rust crate and binary that turns any terminal into a configurable, scriptable visual canvas.
tags:
  - Project
  - Rust
comments: true
---

# Terminal Screensaver

> A Rust crate and binary that turns any terminal into a configurable, scriptable visual canvas.

---

## Signal

!!! info "Project Signal"

	- **Status**: On pause (will return to this)
	- **Focus**: Dynamic, plugin-ready terminal visuals
	- **Stack**: Rust, Crossterm, TOML configs
	- **Ideal For**: Developers who want ambient motion or keyboard-triggered scripts inside the terminal

## Quick Links

- [:fontawesome-brands-github: Repository](https://github.com/BA-CalderonMorales/terminal-screensaver)
- [Architecture Notes](https://github.com/BA-CalderonMorales/terminal-screensaver/blob/main/docs/architecture.md)
- [Configuration Guide](https://github.com/BA-CalderonMorales/terminal-screensaver/blob/main/docs/configuration.md)

## Onboarding Checklist

1. Clone the repo and build the binary: `cargo build --release`.
2. Copy `demo-config.toml` (or create your own) and point the binary to it: `./target/release/terminal-screensaver -c demo-config.toml`.
3. Customize actions or themes by editing the TOML (`[[actions]]`, keyboard mappings, colors) and reloading the app.

## Highlights

- Auto-resizing renderer adapts to any terminal size and keeps animations buttery smooth.
- Plugin/action system triggers shell scripts or commands via single-key shortcuts.
- Works as both a binary and a reusable crate, so you can embed it in your own Rust apps.
- Built-in help overlay documents every configured shortcut while the screensaver runs.

## Core Scenarios

- **Ambient dashboards**: Display branded visuals or subtle motion during pair-programming sessions.
- **Productivity launchpad**: Bind keys to scripts that open projects, run tests, or kick off builds.
- **Crate embedding**: Pull the library into other Rust tools to reuse the animation + input engine.

## Documentation Map

| Document | Description |
| --- | --- |
| [Quick Start](https://github.com/BA-CalderonMorales/terminal-screensaver/blob/main/docs/quick-start.md) | Installation, demo config, and launch instructions |
| [Configuration](https://github.com/BA-CalderonMorales/terminal-screensaver/blob/main/docs/configuration.md) | TOML schema, actions, theming, and keyboard mappings |
| [Architecture](https://github.com/BA-CalderonMorales/terminal-screensaver/blob/main/docs/architecture.md) | Event loop, plugin hooks, and rendering pipeline |
