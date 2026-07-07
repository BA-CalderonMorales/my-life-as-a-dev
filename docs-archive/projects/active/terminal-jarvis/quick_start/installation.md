---
comments: true
---

# Installation Guide

This document provides comprehensive installation instructions for Terminal Jarvis across different platforms and use cases.

## Recommended: Pre-configured Development Environment

**For the best Terminal Jarvis experience, especially for development and testing AI tools:**

### GitHub Codespaces (Cloud Development)

```bash
# Click "Code" → "Codespaces" → "Create codespace" on the repository
# Or use the direct link: https://github.com/codespaces/new?template_repository=BA-CalderonMorales/terminal-jarvis
```

**Advantages:**

- **Instant Setup**: Complete environment ready in 60 seconds
- **Zero Dependencies**: No local software installation required
- **Consistent Experience**: Same environment across all platforms
- **Pre-configured Tools**: Rust 1.87+, Node.js 20+, GitHub CLI, AI tools ready
- **Built-in Debugging**: Full debugging setup with LLDB and VS Code integration

### VS Code Dev Containers (Local Docker)

**Prerequisites:** Docker Desktop + VS Code + Remote-Containers extension

1. Clone the repository
2. Open in VS Code
3. Click "Reopen in Container" when prompted

**Advantages:**

- Consistent environment across team members
- All dependencies pre-installed
- Isolated from host system

## Quick Installation

Terminal Jarvis is available through **three official distribution channels**:

### 1. NPM Installation (Recommended for Most Users)

Try it instantly with npx (no installation required):

```bash
npx terminal-jarvis
```

Or install globally:

```bash
npm install -g terminal-jarvis
```

For production, use the stable version:

```bash
npm install -g terminal-jarvis@stable
```

For testing new features, use beta:

```bash
npm install -g terminal-jarvis@beta
```

### 2. Rust Crate Installation (For Rust Developers)

```bash
cargo install terminal-jarvis
```

Verify the installation:

```bash
terminal-jarvis --help
```

### 3. Homebrew Installation (macOS/Linux Package Manager)

```bash
brew tap ba-calderonmorales/terminal-jarvis
brew install terminal-jarvis
terminal-jarvis --version
```

### Distribution Channel Comparison

| Method       | Best For                         | Pros                                        | Cons                    |
| ------------ | -------------------------------- | ------------------------------------------- | ----------------------- |
| **NPM**      | Node.js users, quick testing     | Instant with npx, multiple release channels | Requires Node.js        |
| **Cargo**    | Rust developers                  | Native Rust toolchain integration           | Requires Rust toolchain |
| **Homebrew** | macOS/Linux system package users | System package manager integration          | Limited to macOS/Linux  |

### NPM Distribution Channels

- **Latest** (`terminal-jarvis`): Most recently published version
- **Stable** (`terminal-jarvis@stable`): Production-ready, thoroughly tested releases
- **Beta** (`terminal-jarvis@beta`): Preview versions with experimental features

## Platform-Specific Instructions

### macOS Prerequisites

!!! warning "Important"
    macOS users must install Rust before using Terminal Jarvis.

```bash
# 1. Install Rust via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Reload your shell environment
source ~/.cargo/env

# 3. Install Terminal Jarvis
npm install -g terminal-jarvis

# 4. Verify installation
terminal-jarvis --help
```

### Linux

```bash
# Most Linux distributions work out-of-the-box
npm install -g terminal-jarvis

# If you encounter issues, install Node.js first:
# Ubuntu/Debian:
sudo apt update && sudo apt install nodejs npm

# CentOS/RHEL/Fedora:
sudo dnf install nodejs npm
```

### Windows

```bash
npm install -g terminal-jarvis
```

For WSL users, follow Linux instructions.

## Building from Source

### Prerequisites

- Rust 1.87 or later (required for full feature support)
- Node.js 20+ and NPM
- Git

### Steps

```bash
git clone https://github.com/BA-CalderonMorales/terminal-jarvis.git
cd terminal-jarvis
cargo build --release
cargo install --path .
terminal-jarvis --help
```

## Requirements and Dependencies

### Required

- **Node.js and NPM**: Required for most AI coding tools
- **Internet connection**: For package updates and installations

### Optional

- **Rust toolchain**: Only required for building from source or on macOS
- **`gh` CLI**: Optional, for template management features
- **Modern terminal**: For best visual experience (Unicode and color support)

## Troubleshooting Installation

### Common Issues

#### "command not found" after NPM install

```bash
npm config get prefix
export PATH="$(npm config get prefix)/bin:$PATH"
source ~/.bashrc
```

#### Permission errors on macOS/Linux

**Option 1:** Use npx instead:
```bash
npx terminal-jarvis
```

**Option 2:** Configure NPM to use a different directory:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### Rust-related errors on macOS

```bash
rustc --version
```

If not found, reinstall Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### NVM Users: PATH Configuration

If you use NVM (Node Version Manager), npm global installs require additional PATH configuration:

```bash
# Add npm global bin to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$(npm config get prefix)/bin:$PATH"
source ~/.bashrc
```

!!! warning "Known Issue"
    Fresh installs in NVM environments may encounter EACCES permission errors. Use `npx terminal-jarvis` as an alternative, or configure npm to use a user-writable directory (see Permission errors section above).

### Verification Steps

```bash
terminal-jarvis --version
terminal-jarvis --help
terminal-jarvis
```

## Uninstallation

### NPM Installation

```bash
npm uninstall -g terminal-jarvis
```

### Source Installation

```bash
cargo uninstall terminal-jarvis
```

## Package Information

**NPM Package Details:**

- **Size**: ~1.2MB compressed / ~2.9MB unpacked
- **Contents**: Pre-compiled binaries, TypeScript wrapper
- **Dependencies**: Zero runtime dependencies
- **Platforms**: Cross-platform support (Windows, macOS, Linux)
- **Testing**: All tools undergo comprehensive integration testing
- **Current Version**: `v0.0.78` (latest GitHub release published on March 1, 2026)
- **Known Issues**: See [Known Limitations](../details/limitations.md) for detailed information

!!! info "Note"
    The current NPM version includes full binary functionality with the complete T.JARVIS interface. No additional installation required!

## Next Steps

After installation, check out:


- [Usage Guide](usage.md) - Learn how to use Terminal Jarvis effectively
- [Configuration Guide](configuration.md) - Customize Terminal Jarvis behavior
- [AI Tools Guide](ai-tools.md) - Explore all supported AI coding tools
