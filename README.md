# My Life As A Dev

[![Build status](https://img.shields.io/github/actions/workflow/status/BA-CalderonMorales/my-life-as-a-dev/github_pages.yml?branch=main&label=build)](https://github.com/BA-CalderonMorales/my-life-as-a-dev/actions)
[![License](https://img.shields.io/github/license/BA-CalderonMorales/my-life-as-a-dev)](https://github.com/BA-CalderonMorales/my-life-as-a-dev/blob/main/LICENSE)
[![Documentation](https://img.shields.io/badge/docs-0.3.1-blue)](https://ba-calderonmorales.github.io/my-life-as-a-dev/)

A living documentation hub for projects, learning notes, and technical references. Powered by Zensical with versioned releases.

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
- **Giscus Comments** - GitHub Discussions-powered comments on every content page
- **Search by Tags** - Filter content by tags like `[Algorithms]`, `[Python]`, `[Interview]`
- **Versioned Documentation** - Every release is preserved with `versioned_deploy.py`
- **Blazing Fast Builds** - Zensical delivers ~0.5-3s builds
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
  help           Show available commands
```

Run `./doc-cli.sh` with no arguments for an interactive menu.

## Versioned Deployment

Deploy a new version:

```bash
# Interactive mode (prompts for version)
./doc-cli.sh deploy

# Direct with version
./doc-cli.sh deploy 0.3.2 --push
```

Version format: `0.x.y` (no `v` prefix). See [Version and Deploy Skill](.github/skills/version-and-deploy/SKILL.md) for full workflow.

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
- Backend: Go proxy on Google Cloud Run + Google ADK (Agent Development Kit)
- AI Model: Any Google Gemini model (currently using Gemini 3 Flash for speed and accuracy)
- Security: CORS validation, prompt injection detection, Secret Manager

**Documentation:**

- [AI Features Overview](https://ba-calderonmorales.github.io/my-life-as-a-dev/docs-as-code/ai/)
- [Architecture Guide](https://ba-calderonmorales.github.io/my-life-as-a-dev/docs-as-code/ai/architecture/)
- [Security Documentation](https://ba-calderonmorales.github.io/my-life-as-a-dev/docs-as-code/security/chat-security/)

## Comments

Every content page (except Home and Resume) has [Giscus](https://giscus.app/) comments powered by GitHub Discussions. The comment theme automatically syncs with the site's dark/light mode toggle.

To leave a comment, sign in with your GitHub account at the bottom of any page.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `make build` to verify
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.
