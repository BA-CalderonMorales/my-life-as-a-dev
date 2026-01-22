---
title: Coder Starter Scripts
description: Platform-specific bootstrap scripts for running personal Coder servers in under two minutes.
tags:
  - Project
  - DevOps
  - Cloud
---

# Coder Starter Scripts

> Platform-specific bootstrap scripts for running personal Coder servers in under two minutes.

---

## Signal

!!! info "Project Signal"

    - **Status**: Active development (local + Codespaces)
    - **Focus**: One-command Coder server bootstrap
    - **Stack**: Bash, curl, GitHub API, Docker
    - **Ideal For**: Developers evaluating Coder or spinning up disposable lab instances

## Quick Links

- [:fontawesome-brands-github: Repository](https://github.com/BA-CalderonMorales/coder-starter-scripts)
- [Starter Scripts](https://github.com/BA-CalderonMorales/coder-starter-scripts/tree/develop/scripts)
- [Quick Start Guide](https://github.com/BA-CalderonMorales/coder-starter-scripts/blob/develop/docs/QUICK_START.md)
- [Maintainer Handbook](https://github.com/BA-CalderonMorales/coder-starter-scripts/blob/develop/docs/MAINTAINER.md)

## Onboarding Checklist

1. Clone the repository and copy `.env.example` to `.env` if you need overrides.
2. Run the platform script that matches your environment (`start.linux.sh`, `start.mac.sh`, `start.windows.sh`, or `start.gh.codespaces.sh`).
3. Open `http://127.0.0.1:3000` to finish the Coder setup wizard and create your first workspace.

## Highlights

- On-demand Coder binary download with architecture detection and retry-safe fallbacks.
- GitHub Codespaces flow that avoids privileged commands and stores binaries inside `.bin/`.
- Built-in PostgreSQL data reset for Windows plus `.env`-driven configuration flags.
- Local-only networking to keep evaluation instances secure by default.

## Core Scenarios

- **Local discovery**: Test new Coder releases on Windows, macOS, or Linux without manual installs.
- **Codespaces pairing**: Provision a Coder server inside a Codespace to dogfood remote-first workflows.
- **Team enablement**: Hand teammates a single script that handles downloads, validation, and startup logging.

## Documentation Map

| Document | Description |
| --- | --- |
| [Quick Start](https://github.com/BA-CalderonMorales/coder-starter-scripts/blob/develop/docs/QUICK_START.md) | Step-by-step walkthrough for installing, launching, and stopping local servers |
| [Maintainer Guide](https://github.com/BA-CalderonMorales/coder-starter-scripts/blob/develop/docs/MAINTAINER.md) | Release workflow, testing matrix, and coding standards for contributors |
| [Agent Playbook](https://github.com/BA-CalderonMorales/coder-starter-scripts/blob/develop/CLAUDE.md) | AI/LLM collaboration rules that keep scripted contributions consistent |
