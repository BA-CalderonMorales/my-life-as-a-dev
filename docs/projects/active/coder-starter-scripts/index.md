# Coder Starter Scripts

**Platform-specific startup scripts for running local Coder server instances**

Automates binary acquisition and environment setup for development and evaluation purposes. Designed for individual developers who need fast, repeatable Coder environments for testing and experimentation.

!!! info "Project Status"
    Active development - stable for local development and testing workflows. GitHub Codespaces support is the primary development focus, with improvements regularly backported to platform-specific scripts.

## Overview

Platform-specific startup scripts that automate the entire process of running a local Coder server instance. The scripts handle binary downloads, environment setup, and server launch with zero manual configuration required.

**Intended Use**: Local development, evaluation, and experimentation with Coder
**Not Intended For**: Production deployments or enterprise installations

## Quick Links


[:fontawesome-brands-github: Repo](https://github.com/BA-CalderonMorales/coder-starter-scripts){ .md-button }

- One-command server startup
- Configurable templates
- Docker-based deployment
- Platform-specific start scripts for Windows, macOS, and Linux
- GitHub Codespaces bootstrap script
- Automatic Coder installation if not found

## Prerequisites

- Git Bash (Windows), Terminal (macOS/Linux)
- Internet connection (for automatic Coder download)

## Quick Start

### Start Server

1. Open your terminal (Git Bash on Windows)
2. Navigate to project directory
3. Run the appropriate start script for your platform:

```console
$ ./start.windows.sh

$ ./start.mac.sh

$ ./start.linux.sh

$ ./start.gh.codespaces.sh
```

4. Open browser to `http://127.0.0.1:3000`

### Stop Server

Press `Ctrl+C` in terminal

## Configuration

Configure with `.env` file (see `.env.example` in repository)

## Automatic Coder Installation

The start scripts will automatically download and install Coder if it's not found in the project directory:

1. Direct download from GitHub releases (primary method)
2. Platform-specific package managers (fallback)
3. Manual download instructions (final fallback)

## Platform Support

| Platform | Script | Status | Notes |
|----------|--------|--------|-------|
| Linux | `start.linux.sh` | Stable | Tested on Ubuntu, supports apt fallback |
| macOS | `start.mac.sh` | Stable | Supports both Intel and Apple Silicon |
| Windows | `start.windows.sh` | Stable | Requires Git Bash or WSL |
| GitHub Codespaces | `start.gh.codespaces.sh` | Active Development | Primary development target |

## Architecture

### Binary Management

Scripts follow a strict policy of never committing the Coder binary to version control:


- Binaries are downloaded on-demand from GitHub releases
- Codespaces script isolates downloads in `.bin/` directory (gitignored)
- Legacy platform scripts download to project root (also gitignored)
- All binaries and archives are excluded via `.gitignore`

### Download Strategy

Each script implements a multi-method fallback approach:

1. **Primary**: Direct download from GitHub releases
    - Fetches latest version via GitHub API
    - Automatic architecture detection (amd64/arm64)
    - Platform-specific archive formats (tar.gz for Linux, zip for macOS/Windows)

2. **Fallback**: Platform package manager
    - Windows: winget
    - macOS: Homebrew
    - Linux: apt

3. **Final Fallback**: Manual installation instructions

### Codespaces-Specific Design

The `start.gh.codespaces.sh` script is purpose-built for ephemeral environments:


- No privileged operations (no sudo/apt)
- Strict error handling (`set -euo pipefail`)
- Robust version detection with API rate limit fallback
- Temporary directory extraction with safe binary discovery
- Environment-based configuration flags

**Codespaces Options:**

```console
$ SKIP_CODER_SERVER=1 ./start.gh.codespaces.sh

$ QUIET=1 ./start.gh.codespaces.sh

$ rm -f .bin/coder && ./start.gh.codespaces.sh
```

### Windows-Specific Behavior

The Windows script includes PostgreSQL directory management:


- Loads `.env` file if present (for `POSTGRES_DIR` override)
- Defaults to `$HOME/AppData/Roaming/coderv2/postgres`
- Removes and recreates directory on each startup for clean state

## Limitations

This project is explicitly scoped for local development and evaluation:

!!! warning "Not for Production"
    1. **No High Availability**: Single-instance deployments only
    2. **Ephemeral Data**: Windows script resets PostgreSQL data on each run
    3. **No Security Hardening**: Uses default configurations and embedded databases
    4. **Single-User Focus**: Designed for individual developer workflows
    5. **No Update Management**: Always pulls latest release (no version pinning yet)
    6. **Limited Network Options**: Binds to localhost only

## Documentation

For comprehensive documentation, visit the [GitHub repository](https://github.com/BA-CalderonMorales/coder-starter-scripts).

Key documentation files:

- [Quick Start Guide](https://github.com/BA-CalderonMorales/coder-starter-scripts/blob/develop/docs/QUICK_START.md)
- [Maintainer Guide](https://github.com/BA-CalderonMorales/coder-starter-scripts/blob/develop/docs/MAINTAINER.md)
- [Project Instructions](https://github.com/BA-CalderonMorales/coder-starter-scripts/blob/develop/CLAUDE.md)
