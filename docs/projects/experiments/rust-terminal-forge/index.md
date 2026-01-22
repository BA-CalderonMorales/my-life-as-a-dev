---
title: Rust Terminal Forge
description: Browser-based terminal emulator that marries a React front end with a Rust-powered execution core.
tags:
  - Experiment
  - Rust
  - React
  - TypeScript
---

# Rust Terminal Forge

> Browser-based terminal emulator that marries a React front end with a Rust-powered execution core.

---

## Signal

!!! info "Project Signal"

	- **Status**: Experimental, actively prototyping
	- **Focus**: Secure, sandboxed terminals in the browser
	- **Stack**: React, TypeScript, Vite, Rust backend exposed via WebAssembly/websocket bridge
	- **Ideal For**: Builders exploring hybrid Rust + frontend architectures

## Quick Links

- [:fontawesome-brands-github: Repository](https://github.com/BA-CalderonMorales/rust-terminal-forge)
- [Production Demo](https://rust-terminal-forge.lovable.app/)
- [QA Build](https://ba-calderonmorales.github.io/rust-terminal-forge/)
- [Issue Tracker](https://github.com/BA-CalderonMorales/rust-terminal-forge/issues)

## Onboarding Checklist

1. Install dependencies for the React client (`pnpm install`) and start it with `pnpm dev`.
2. Build/run the Rust backend (see `server/` instructions) to expose websocket connections for the terminal stream.
3. Configure `.env` values for allowed commands and API keys, then open the browser UI to connect to the local server.

## Highlights

- Full terminal emulation rendered via React with caret, cursor, and theme support.
- Rust backend enforces command safelists while streaming output efficiently to the browser.
- Responsive layout keeps touch bars and keyboard shortcuts usable on tablets.

## Core Scenarios

- **Remote labs**: Offer sandboxed terminals for demos or onboarding labs without exposing SSH.
- **Hybrid stack experiments**: Prototype Rust + TypeScript interop patterns for other projects.
- **Security research**: Test enforcement of allowed commands, rate limits, and session isolation.

## Documentation Map

| Document | Description |
| --- | --- |
| [Quick Start](quick_start/index.md) | Dev environment, scripts, and dual frontend/backend boot sequence |
| [Terminal Details](details/index.md) | Architecture notes covering websocket streaming and security controls |
| [Known Issues](https://github.com/BA-CalderonMorales/rust-terminal-forge/issues) | Track experimental limitations and open bugs |
