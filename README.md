# My Life As A Dev

[![Build status](https://img.shields.io/github/actions/workflow/status/BA-CalderonMorales/my-life-as-a-dev/github_pages.yml?branch=main&label=build)](https://github.com/BA-CalderonMorales/my-life-as-a-dev/actions)
[![License](https://img.shields.io/github/license/BA-CalderonMorales/my-life-as-a-dev)](https://github.com/BA-CalderonMorales/my-life-as-a-dev/blob/main/LICENSE)
[![Documentation](https://img.shields.io/badge/docs-latest-blue)](https://ba-calderonmorales.github.io/my-life-as-a-dev/)

A living documentation hub for projects, learning notes, and technical references. Powered by Zensical with versioned releases via mike.

![Site Preview](docs/assets/images/homepage-screenshot.png)

<p align="center">
  <a href="https://ba-calderonmorales.github.io/my-life-as-a-dev/"><strong>Explore the Documentation</strong></a>
</p>

## Quick Links

- [Live Documentation](https://ba-calderonmorales.github.io/my-life-as-a-dev/) - Browse the latest published docs
- [Docs as Code](https://ba-calderonmorales.github.io/my-life-as-a-dev/docs-as-code/) - Architecture, security, and implementation guides
- [Learning Section](https://ba-calderonmorales.github.io/my-life-as-a-dev/learning/) - Algorithms, data structures, and interview prep
- [Active Projects](https://ba-calderonmorales.github.io/my-life-as-a-dev/projects/active/) - Terminal Jarvis, Coder Infrastructure, and more
- [Experiments](https://ba-calderonmorales.github.io/my-life-as-a-dev/projects/experiments/) - Immersive Awe Canvas, Shadow Scroll Blossom, Rust Terminal Forge

## Features

- **AI-Powered Chat Widget** - Claude Docs-inspired assistant using Gemini API via Cloud Run
- **Search by Tags** - Filter content by tags like `[Algorithms]`, `[Python]`, `[Interview]`
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
3. Select from the interactive menu: `serve` or `build`

### Local Development

**Prerequisites:** Python 3.10+ and [uv](https://docs.astral.sh/uv/)

```bash
# Clone and enter the repo
git clone https://github.com/BA-CalderonMorales/my-life-as-a-dev.git
cd my-life-as-a-dev

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies and start dev server
make setup
make serve
```

## Documentation CLI

The Rust-powered `doc-cli` provides a unified interface for all documentation tasks:

```
doc-cli [COMMAND]

Primary Commands:
  serve          Start development server (port 8001)
  build          Build site with Zensical

Version & Deploy:
  bump-version   Create a new documentation version
  deploy         Publish all versions to GitHub Pages
  help           Show available commands
```

Run `./doc-cli.sh` with no arguments for an interactive menu.

## Repository Layout

```
my-life-as-a-dev/
├── docs/                  # Documentation content and assets
├── config/zensical/       # Modular Zensical configuration
├── zensical.toml          # Generated Zensical configuration
├── scripts/rust/          # Rust CLI source (doc-cli)
├── scripts/python/        # Python helper scripts
├── e2e/                   # End-to-end tests (Playwright)
├── tests/                 # Unit tests
└── site/                  # Built static site (gitignored)
```

## AI Chat Widget

The site features a Claude Docs-inspired chat widget with security-first design.

**Stack:**

- Frontend: MVVM architecture with JavaScript DOM injection, rate limiting, and XSS prevention
- Backend: Google Cloud Run with Google ADK (Agent Development Kit)
- AI Model: Google Gemini 2.0 Flash with multi-agent orchestration
- Security: CORS validation, prompt injection detection, Secret Manager

**Documentation:**

- [AI Features Overview](https://ba-calderonmorales.github.io/my-life-as-a-dev/docs-as-code/ai/)
- [Architecture Guide](https://ba-calderonmorales.github.io/my-life-as-a-dev/docs-as-code/ai/architecture/)
- [Security Documentation](https://ba-calderonmorales.github.io/my-life-as-a-dev/docs-as-code/security/chat-security/)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `make build` to verify
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.
