# My Life As A Dev

[![Build status](https://img.shields.io/github/actions/workflow/status/BA-CalderonMorales/my-life-as-a-dev/github_pages.yml?branch=main&label=build)](https://github.com/BA-CalderonMorales/my-life-as-a-dev/actions)
[![License](https://img.shields.io/github/license/BA-CalderonMorales/my-life-as-a-dev)](https://github.com/BA-CalderonMorales/my-life-as-a-dev/blob/main/LICENSE)
[![Documentation](https://img.shields.io/badge/docs-latest-blue)](https://ba-calderonmorales.github.io/my-life-as-a-dev/)

A living documentation site built with MkDocs Material. The goal of this repository is to keep personal development notes, project documentation, and technical references in one place with a consistent structure that is easy to maintain and evolve.

## Quick links
- [Live documentation](https://ba-calderonmorales.github.io/my-life-as-a-dev/)
- [Repository](https://github.com/BA-CalderonMorales/my-life-as-a-dev)
- [Documentation CLI (`doc-cli`)](#documentation-cli-tool)

## What this project provides
- A centralized, versioned documentation hub powered by MkDocs Material and mike
- A reusable agents/ framework shared with repositories like [immersive-awe-canvas](https://github.com/BA-CalderonMorales/immersive-awe-canvas) and [rust-terminal-forge](https://github.com/BA-CalderonMorales/rust-terminal-forge)
- A Rust-based `doc-cli` tool for starting the docs site, bumping versions, and deploying releases
- A stable GitHub Pages pipeline for publishing documentation updates

## Getting started

### GitHub Codespaces
This repository is configured for Codespaces so you can be productive immediately.

1. Open the green **Code** button on GitHub and choose **Open with Codespaces**.
2. Create a new Codespace and, once ready, run the Linux-native CLI:
   ```bash
   doc-cli startup
   ```
   The command compiles the Rust tools, installs dependencies, and launches the interactive menu.
3. If you prefer the wrapper script instead of the binary:
   ```bash
   ./doc-cli.sh startup
   ```

### Local development
Prerequisites: Python 3.10+ and `pip`.

1. Clone the repository:
   ```bash
   git clone https://github.com/BA-CalderonMorales/my-life-as-a-dev.git
   cd my-life-as-a-dev
   ```
2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies and the local plugins:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   pip install -e .
   ```
4. Serve the documentation locally:
   ```bash
   export PYTHONPATH=$PYTHONPATH:$(pwd)
   mkdocs serve
   ```
   The site is available at http://127.0.0.1:8000/.

To build the static site instead of serving it:
```bash
export PYTHONPATH=$PYTHONPATH:$(pwd)
mkdocs build --verbose
```

**WSL note:** if the `doc-cli` tool has issues in WSL, run `mkdocs serve` directly with the commands above.

## Documentation versioning
Documentation releases are versioned with mike and published via GitHub Pages.

- Create a new version with the helper script:
  ```bash
  ./scripts/bump-version.sh
  ```
- Choose a semantic version bump (major, minor, or patch). The script tags the release, updates `versions.json`, and triggers the publish workflow.
- GitHub Actions builds and deploys the site automatically after the tag is pushed.

## Documentation CLI tool
The Rust-based CLI gives a consistent interface for common documentation tasks. Run it as `doc-cli`, `./doc-cli`, or directly from the Cargo target at `./scripts/rust/target/release/doc-cli`.

### Core commands
- `startup` – set up dependencies and start the development server
- `bump-version` – create a new documentation version and optionally deploy it
- `deploy` – publish all versions to GitHub Pages (use `--force` to redeploy)
- `help` – show available commands and flags

Running `doc-cli` without arguments opens an interactive menu to pick an action.

## Repository layout
```
my-life-as-a-dev/
├── agents/                # Agent framework guidelines
├── mkdocs.yml             # MkDocs configuration
├── requirements.txt       # Python dependencies
├── doc-cli.sh             # CLI wrapper script
├── docs/                  # Documentation source files
│   ├── .nav.yml           # MkDocs navigation
│   ├── index.md           # Homepage
│   ├── assets/            # Images and static files
│   ├── repositories/      # Pages for related repositories
│   └── overrides/         # MkDocs Material theme overrides
├── mkdocs_plugins/        # Custom MkDocs plugins
└── scripts/               # Utility scripts (Rust and Python)
```

## Testing GitHub Actions locally
You can simulate the Pages workflow with [Act](https://github.com/nektos/act):
```bash
act -j test_docs -w .github/workflows/test_github_pages.yml
```
Add `-P version=<x.y.z>` to test a specific version. The workflow runs MkDocs in dry-run mode so no tags or deployments are pushed.

## Staying informed
The live site is hosted on GitHub Pages. Availability may fluctuate; feel free to open an issue if you spot downtime or outdated content.
