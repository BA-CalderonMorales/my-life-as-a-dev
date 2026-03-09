# My Life As A Dev

[![Build status](https://img.shields.io/github/actions/workflow/status/BA-CalderonMorales/my-life-as-a-dev/github_pages.yml?branch=main&label=build)](https://github.com/BA-CalderonMorales/my-life-as-a-dev/actions)
[![License](https://img.shields.io/github/license/BA-CalderonMorales/my-life-as-a-dev)](https://github.com/BA-CalderonMorales/my-life-as-a-dev/blob/main/LICENSE)
[![Documentation](https://img.shields.io/badge/docs-live-blue)](https://ba-calderonmorales.github.io/my-life-as-a-dev/)

A versioned documentation hub for projects, learning notes, and platform experiments. The site is built with Zensical, themed with Material for MkDocs, and released to GitHub Pages with mike.

![Site Preview](docs/assets/images/homepage-screenshot.png)

<p align="center">
  <a href="https://ba-calderonmorales.github.io/my-life-as-a-dev/"><strong>Explore the Documentation</strong></a>
</p>

## Quick Links

- [Live Documentation](https://ba-calderonmorales.github.io/my-life-as-a-dev/) - Browse the published site
- [Docs-as-Code Platform](https://ba-calderonmorales.github.io/my-life-as-a-dev/docs-as-code/) - Workflow, stack, AI, and security guides
- [Learning Section](https://ba-calderonmorales.github.io/my-life-as-a-dev/learning/) - Algorithms, data structures, and interview prep
- [Projects](https://ba-calderonmorales.github.io/my-life-as-a-dev/projects/) - Active work, experiments, and supporting notes

## Stack

- **Zensical** for primary local development and production builds
- **Material for MkDocs** for navigation, theme components, and content rendering
- **Mike** for versioned documentation releases
- **Rust `doc-cli`** for local serve, build, and deploy workflows
- **GitHub Actions** for CI and GitHub Pages deployment

## Local Development

### Prerequisites

- Python 3.10+
- [uv](https://docs.astral.sh/uv/)
- Rust and Cargo if you want to rebuild `doc-cli`

### Setup

```bash
git clone https://github.com/BA-CalderonMorales/my-life-as-a-dev.git
cd my-life-as-a-dev
uv venv .venv
make setup
```

### Common Commands

```bash
make serve        # Start Zensical on port 8001
make build        # Production build
./doc-cli serve   # CLI wrapper for local serving
./doc-cli build   # CLI wrapper for builds
./doc-cli.sh      # Interactive menu
```

The local site is served at `http://localhost:8001/my-life-as-a-dev/`.

## Versioned Release Workflow

```bash
./doc-cli deploy
./doc-cli deploy 0.3.2 --push
```

Notes:

- `config/zensical/*.toml` is auto-merged into `zensical.toml` during serve and build commands.
- Run `make build` before committing documentation changes.
- Use Conventional Commits for release-friendly history.

## Repository Layout

```text
my-life-as-a-dev/
|-- docs/                  # Documentation content and assets
|-- config/zensical/       # Modular Zensical configuration
|-- zensical.toml          # Generated Zensical configuration
|-- scripts/rust/          # Rust CLI source (doc-cli)
|-- scripts/python/        # Python helper scripts
|-- e2e/                   # End-to-end tests
|-- tests/                 # Unit tests
`-- site/                  # Built static site (gitignored)
```

## AI Chat Widget

The site includes a docs assistant interface with a browser-side widget and a Cloud Run proxy backend.

- Frontend: JavaScript MVVM structure with DOM injection, rate limiting, and XSS protections
- Backend: Go proxy plus Google ADK flows on Google Cloud Run
- Security: CORS validation, prompt-injection handling, and Secret Manager-backed configuration

Related documentation:

- [AI Overview](https://ba-calderonmorales.github.io/my-life-as-a-dev/docs-as-code/ai/)
- [AI Architecture](https://ba-calderonmorales.github.io/my-life-as-a-dev/docs-as-code/ai/architecture/)
- [Chat Widget Security](https://ba-calderonmorales.github.io/my-life-as-a-dev/docs-as-code/security/chat-security/)

## Contributing

1. Create a branch for your change.
2. Make the update.
3. Run `make build`.
4. Submit a pull request.

## License

MIT License - see [LICENSE](LICENSE) for details.
