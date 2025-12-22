# Terminal Screensaver

A dynamic terminal screen saver crate with plugin architecture that automatically resizes with any screen size.

## Overview

Terminal Screensaver is a high-performance Rust application that provides beautiful, customizable screensavers for your terminal. With its plugin architecture and script integration capabilities, it's both a screensaver and a productivity tool.

## Quick Links

- [:fontawesome-brands-github: GitHub Repository](https://github.com/BA-CalderonMorales/terminal-screensaver)

## Key Features

- **Dynamic Sizing**: Automatically adapts to any terminal size
- **Script Integration**: Execute any script or command with custom keyboard shortcuts
- **Plugin Architecture**: Extensible event handling for custom actions
- **TOML Configuration**: Easy customization without code changes
- **Cross-platform**: Works on Windows, Linux, and macOS
- **Library & Binary**: Use as a library or standalone application
- **Interactive Help Display**: Built-in help panel with keyboard shortcuts
- **Customizable Themes**: Multiple theme options

## Installation

### From Source

```bash
git clone https://github.com/BA-CalderonMorales/terminal-screensaver.git
cd terminal-screensaver
cargo build --release
```

Run with the demo configuration:

```bash
./target/release/terminal-screensaver -c demo-config.toml
```

### As a Library

Add to your `Cargo.toml`:

```toml
[dependencies]
terminal-screensaver = "0.1.0"
```

## Configuration

Basic configuration example:

```toml
text = "My Terminal Screensaver"
style = "default"

[[actions]]
key = "h"
description = "Say Hello"
command = "./scripts/hello.sh"
```

## Controls

| Key | Action |
|-----|--------|
| `ESC` | Exit screensaver |
| `ENTER` | Show action menu |
| `a-z, 0-9, symbols` | Execute configured actions |

## Project Status

- Status: Actively developed
- License: MIT
- Language: Rust

## Documentation

For comprehensive documentation, visit the [GitHub repository](https://github.com/BA-CalderonMorales/terminal-screensaver).

Key documentation files:

- [Architecture](https://github.com/BA-CalderonMorales/terminal-screensaver/blob/main/docs/architecture.md)
- [Features Guide](https://github.com/BA-CalderonMorales/terminal-screensaver/blob/main/docs/features.md)
- [Configuration Guide](https://github.com/BA-CalderonMorales/terminal-screensaver/blob/main/docs/configuration.md)
- [Controls & Keyboard Shortcuts](https://github.com/BA-CalderonMorales/terminal-screensaver/blob/main/docs/controls.md)
- [Quick Start Guide](https://github.com/BA-CalderonMorales/terminal-screensaver/blob/main/docs/quick-start.md)
- [Testing Guide](https://github.com/BA-CalderonMorales/terminal-screensaver/blob/main/docs/testing.md)
- [CI/CD](https://github.com/BA-CalderonMorales/terminal-screensaver/blob/main/docs/cicd.md)

## Contributing

All contributions are welcome! Check the repository for contribution guidelines.
