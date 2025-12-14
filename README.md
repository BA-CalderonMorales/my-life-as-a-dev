# My Life As A Dev

[![Build status](https://img.shields.io/github/actions/workflow/status/BA-CalderonMorales/my-life-as-a-dev/github_pages.yml?branch=main&label=build)](https://github.com/BA-CalderonMorales/my-life-as-a-dev/actions)
[![License](https://img.shields.io/github/license/BA-CalderonMorales/my-life-as-a-dev)](https://github.com/BA-CalderonMorales/my-life-as-a-dev/blob/main/LICENSE)
[![Documentation](https://img.shields.io/badge/docs-latest-blue)](https://ba-calderonmorales.github.io/my-life-as-a-dev/)

Living documentation for projects, notes, and technical references, powered by MkDocs Material and mike.

## Quick links
- [Live documentation](https://ba-calderonmorales.github.io/my-life-as-a-dev/)
- [Repository](https://github.com/BA-CalderonMorales/my-life-as-a-dev)
- [Rust documentation CLI](#documentation-cli)

## At a glance
- MkDocs Material site with versioned releases via mike
- Rust-powered `doc-cli` for setup, serving, version bumps, and deploys
- GitHub Pages pipeline that builds and publishes on push
- Local plugins (`mkdocs_plugins`) for custom behavior

## Choose your setup

### GitHub Codespaces
1) Open the green **Code** button on GitHub and select **Open with Codespaces**.
2) When the container finishes, start the CLI:
   ```bash
   doc-cli startup
   ```
   This compiles the Rust tools, installs dependencies, and launches an interactive menu.
3) Prefer the wrapper script? Run:
   ```bash
   ./doc-cli.sh startup
   ```

### Local development
Prerequisites: Python 3.10+ and `uv` (recommended). If `uv` is unavailable, use `pip` instead.

1) Clone the repo and enter it:
   ```bash
   git clone https://github.com/BA-CalderonMorales/my-life-as-a-dev.git
   cd my-life-as-a-dev
   ```
2) (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```
3) Install dependencies and register local plugins:
   ```bash
   uv pip install --upgrade pip
   uv pip install -r requirements.txt
   uv pip install -e .
   ```
4) Serve the docs locally:
   ```bash
   export PYTHONPATH=$PYTHONPATH:$(pwd)
   uv run mkdocs serve
   ```
   The site will be available at http://127.0.0.1:8000/.

To build instead of serve:
```bash
export PYTHONPATH=$PYTHONPATH:$(pwd)
uv run mkdocs build --verbose
```

**WSL note:** If `doc-cli` misbehaves under WSL, run `mkdocs serve` directly as shown above.

## Documentation CLI
`doc-cli` (Rust) gives a consistent interface for docs tasks. Use `doc-cli`, `./doc-cli`, or `./scripts/rust/target/release/doc-cli`.

**Core commands**
- `startup` – set up dependencies and start the dev server
- `bump-version` – create a new docs version and optionally deploy
- `deploy` – publish all versions to GitHub Pages (use `--force` to redeploy)
- `help` – show commands and flags

Running `doc-cli` with no arguments opens the interactive menu.

## Versioning and deploys
Documentation is versioned with mike and published to GitHub Pages.
- Create a new version with the helper script:
  ```bash
  ./scripts/bump-version.sh
  ```
- Choose a semantic version bump (major, minor, patch). The script tags the release, updates `versions.json`, and kicks off the publish workflow.
- GitHub Actions builds and deploys automatically after the tag is pushed.

## Repository layout
```
my-life-as-a-dev/
├── doc-cli/               # Rust source for the CLI
├── doc-cli.sh             # CLI wrapper script
├── docs/                  # MkDocs content and assets
├── e2e/                   # End-to-end tests for the site
├── mkdocs.yml             # MkDocs configuration
├── mkdocs_plugins/        # Custom MkDocs plugins (editable install)
├── scripts/               # Python and Rust helper scripts
├── site/                  # Built static site (gitignored in most workflows)
└── tests/                 # Unit tests for plugins and utilities
```

## Test the Pages workflow locally
Simulate the GitHub Pages workflow with [Act](https://github.com/nektos/act):
```bash
act -j test_docs -w .github/workflows/test_github_pages.yml
```
Add `-P version=<x.y.z>` to exercise a specific version. The workflow runs MkDocs in dry-run mode—no tags or deployments are pushed.

## Questions or issues?
The site is hosted on GitHub Pages. Open an issue if you see downtime, broken links, or outdated content.
