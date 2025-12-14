# My Life As A Dev

[![Build status](https://img.shields.io/github/actions/workflow/status/BA-CalderonMorales/my-life-as-a-dev/github_pages.yml?branch=main&label=build)](https://github.com/BA-CalderonMorales/my-life-as-a-dev/actions)
[![License](https://img.shields.io/github/license/BA-CalderonMorales/my-life-as-a-dev)](https://github.com/BA-CalderonMorales/my-life-as-a-dev/blob/main/LICENSE)
[![Documentation](https://img.shields.io/badge/docs-latest-blue)](https://ba-calderonmorales.github.io/my-life-as-a-dev/)

<p align="center">
  <a href="https://ba-calderonmorales.github.io/my-life-as-a-dev/">
    <img src="docs/assets/images/homepage-screenshot.png" alt="Site Preview" width="800" />
  </a>
</p>

<p align="center">
  <strong>A living documentation hub for projects, learning notes, and technical references.</strong><br>
  Powered by Zensical with versioned releases via mike.
</p>

## Quick Links

| Resource | Description |
|----------|-------------|
| [Live Documentation](https://ba-calderonmorales.github.io/my-life-as-a-dev/) | Browse the latest published docs |
| [Learning Section](https://ba-calderonmorales.github.io/my-life-as-a-dev/learning/) | Algorithms, data structures, and interview prep |
| [Active Projects](https://ba-calderonmorales.github.io/my-life-as-a-dev/projects/active/) | Terminal Jarvis, Coder Infrastructure, and more |
| [Experiments](https://ba-calderonmorales.github.io/my-life-as-a-dev/projects/experiments/) | Immersive Awe Canvas, Shadow Scroll Blossom, Rust Terminal Forge |

## Features

- **Versioned Documentation** - Every release is preserved with mike
- **Blazing Fast Builds** - Zensical delivers ~0.4s builds (20x faster than MkDocs)
- **Rust-powered CLI** - doc-cli for setup, serving, version bumps, and deploys
- **GitHub Pages Pipeline** - Automatic builds and deploys on every push
- **Dark/Light Mode** - Toggle between themes with one click

## Getting Started

### GitHub Codespaces (Recommended)

1. Click the green **Code** button and select **Open with Codespaces**
2. Wait for the container to build, then run:
   ```bash
   ./doc-cli.sh
   ```
3. Select from the interactive menu:
   - serve - Start Zensical dev server (port 8001)
   - build - Build site with Zensical

### Local Development

**Prerequisites:** Python 3.10+ and [uv](https://docs.astral.sh/uv/) (recommended)

```bash
# Clone and enter the repo
git clone https://github.com/BA-CalderonMorales/my-life-as-a-dev.git
cd my-life-as-a-dev

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
make setup

# Start dev server
make serve  # Zensical on port 8001
```

## Documentation CLI

The Rust-powered doc-cli provides a unified interface for all documentation tasks:

```
doc-cli [COMMAND]

Primary Commands (Zensical):
  serve                Start development server (port 8001)
  build                Build site with Zensical

Legacy Commands (MkDocs):
  mkdocs-serve         Start MkDocs development environment

Version & Deploy:
  bump-version         Create a new documentation version
  deploy               Publish all versions to GitHub Pages
  help                 Show available commands
```

Run ./doc-cli.sh with no arguments for an interactive menu.

## Build Performance

| Build System | Time | Notes |
|--------------|------|-------|
| Zensical | ~0.4s | Primary, modern builds |
| MkDocs Material | ~8s | Legacy, versioning with mike |

## Repository Layout

```
my-life-as-a-dev/
├── docs/                  # Documentation content and assets
├── mkdocs.yml             # MkDocs configuration
├── zensical.toml          # Zensical configuration
├── mkdocs_plugins/        # Custom MkDocs plugins
├── scripts/rust/          # Rust CLI source (doc-cli)
├── scripts/python/        # Python helper scripts
├── e2e/                   # End-to-end tests
└── site/                  # Built static site (gitignored)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run make build to verify
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.