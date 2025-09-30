# Coder Starter Scripts

Run a local Coder server instance with automated setup scripts.

## Overview

Repository for running a local Coder server instance. Perfect for teams wanting self-hosted development environments.

## Quick Links

- [:material-github: GitHub Repository](https://github.com/BA-CalderonMorales/coder-starter-scripts)
- [:material-file-document: Official Coder Docs](https://github.com/coder/coder)

## Key Features

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

```bash
# Windows
./start.windows.sh

# macOS
./start.mac.sh

# Linux
./start.linux.sh

# GitHub Codespaces (inside a Codespace terminal)
./start.gh.codespaces.sh
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

## GitHub Codespaces Usage

We currently lean on `./start.gh.codespaces.sh` to rapidly spin up and tear down an isolated learning/experimentation environment without polluting local machines. This script is optimized for:

- Ephemeral environments (open Codespace, explore, discard)
- Fast bootstrap (auto-download if Coder binary missing)
- Consistent baseline across contributors

## Documentation

For comprehensive documentation, visit the [GitHub repository](https://github.com/BA-CalderonMorales/coder-starter-scripts).

Key documentation files:
- [Quick Start Guide](https://github.com/BA-CalderonMorales/coder-starter-scripts/blob/develop/docs/QUICK_START.md)
- [Maintainer Guide](https://github.com/BA-CalderonMorales/coder-starter-scripts/blob/develop/docs/MAINTAINER.md)
