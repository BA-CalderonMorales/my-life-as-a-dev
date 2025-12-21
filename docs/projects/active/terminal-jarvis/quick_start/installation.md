# Installation Guide

This document provides comprehensive installation instructions for Terminal Jarvis across different platforms and use cases.

## Recommended: Pre-configured Development Environment

**For the best Terminal Jarvis experience, especially for development and testing AI tools:**

### GitHub Codespaces (Cloud Development)

```console

```

**Advantages:**

- **Instant Setup**: Complete environment ready in 60 seconds
- **Zero Dependencies**: No local software installation required
- **Consistent Experience**: Same environment across all platforms
- **Pre-configured Tools**: Rust 1.87, Node.js 20, GitHub CLI, AI tools ready
- **Built-in Debugging**: Full debugging setup with LLDB and VS Code integration

### VS Code Dev Containers (Local Docker)

```console

```

**Advantages:**

- Consistent environment across team members
- All dependencies pre-installed
- Isolated from host system

## Quick Installation

Terminal Jarvis is available through **three official distribution channels**:

### 1. NPM Installation (Recommended for Most Users)

```console
$ npx terminal-jarvis

$ npm install -g terminal-jarvis

$ npm install -g terminal-jarvis@stable

$ npm install -g terminal-jarvis@beta
```

### 2. Rust Crate Installation (For Rust Developers)

```console
$ cargo install terminal-jarvis

$ terminal-jarvis --help
```

### 3. Homebrew Installation (macOS/Linux Package Manager)

```console
$ brew tap ba-calderonmorales/terminal-jarvis

$ brew install terminal-jarvis

$ terminal-jarvis --version
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

```console
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

$ source ~/.cargo/env

$ npm install -g terminal-jarvis

$ terminal-jarvis --help
```

### Linux

```console
$ npm install -g terminal-jarvis

$ sudo apt update && sudo apt install nodejs npm

$ sudo dnf install nodejs npm
```

### Windows

```console
$ npm install -g terminal-jarvis
```

## Building from Source

### Prerequisites

- Rust 1.70 or later
- Node.js and NPM
- Git

### Steps

```console
$ git clone https://github.com/BA-CalderonMorales/terminal-jarvis.git
$ cd terminal-jarvis

$ cargo build --release

$ cargo install --path .

$ terminal-jarvis --help
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

```console
$ npm config get prefix

$ export PATH="$(npm config get prefix)/bin:$PATH"

$ source ~/.bashrc  # or ~/.zshrc
```

#### Permission errors on macOS/Linux

```console
$ npx terminal-jarvis

$ mkdir ~/.npm-global
$ npm config set prefix '~/.npm-global'
$ echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
$ source ~/.bashrc
```

#### Rust-related errors on macOS

```console
$ rustc --version

$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
$ source ~/.cargo/env
```

### Verification Steps

```console
$ terminal-jarvis --version

$ terminal-jarvis --help

$ terminal-jarvis
```

## Uninstallation

### NPM Installation

```console
$ npm uninstall -g terminal-jarvis
```

### Source Installation

```console
$ cargo uninstall terminal-jarvis
```

## Package Information

**NPM Package Details:**

- **Size**: ~1.2MB compressed / ~2.9MB unpacked
- **Contents**: Pre-compiled binaries, TypeScript wrapper
- **Dependencies**: Zero runtime dependencies
- **Platforms**: Cross-platform support (Windows, macOS, Linux)
- **Testing**: All tools undergo comprehensive integration testing
- **Current Version**: See the README badges or run `terminal-jarvis --version`
- **Known Issues**: See [Known Limitations](../details/limitations.md) for detailed information

!!! info "Note"
    The current NPM version includes full binary functionality with the complete T.JARVIS interface. No additional installation required!

## Next Steps

After installation, check out:


- [Usage Guide](usage.md) - Learn how to use Terminal Jarvis effectively
- [Configuration Guide](configuration.md) - Customize Terminal Jarvis behavior
- [AI Tools Guide](ai-tools.md) - Explore all supported AI coding tools
