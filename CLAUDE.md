# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a documentation consolidation hub built with MkDocs Material. It serves as a central location for personal development notes, project documentation, and technical resources. The site uses versioned documentation with `mike` and deploys to GitHub Pages.

## Core Architecture

### Technology Stack

- **Documentation**: MkDocs with Material theme
- **Custom Tooling**: Rust CLI (`doc-cli`) for workflow automation
- **Python Version**: 3.10+
- **Versioning**: mike plugin for documentation versions
- **AI Integration**: Custom AI proxy using GitHub Models (Azure AI Inference) for per-page chat

### Key Components

1. **MkDocs Configuration** (`mkdocs.yml`): Defines site structure, theme settings, plugins, and markdown extensions
2. **Custom Rust CLI** (`scripts/rust/`): Unified command-line tool with subcommands:
   - `startup`: Sets up dev environment and starts MkDocs server
   - `bump-version`: Creates new semantic version tags
   - `deploy`: Deploys all versions to GitHub Pages
3. **Custom MkDocs Plugin** (`mkdocs_plugins/`): AI-assisted content generation plugin (currently disabled)
4. **AI Proxy** (`scripts/python/ai_proxy.py`): FastAPI service for per-page documentation chat (NOT ENABLED - see AGENTS.md)
5. **Python Utilities** (`scripts/python/`): Repository synchronization and page generation scripts

### Directory Structure

```
my-life-as-a-dev/
├── agents/                    # LLM workflow guidelines
│   ├── RULES.md              # Repository workflow rules
│   └── MEMORY.md             # Development guidelines (TDD, TypeScript, etc.)
├── docs/                     # Documentation source files
│   ├── .nav.yml             # Navigation configuration
│   ├── index.md             # Homepage
│   ├── overrides/           # MkDocs Material theme overrides
│   └── repositories/        # Per-repository documentation
├── scripts/
│   ├── rust/                # Rust CLI tools
│   │   ├── src/doc-cli.rs  # Main CLI entry point
│   │   └── lib/            # Command implementations (startup, bump_version, deploy)
│   └── python/             # Python utilities for doc generation and sync
├── mkdocs_plugins/          # Custom MkDocs plugins
├── mkdocs.yml              # MkDocs configuration
├── requirements.txt        # Python dependencies
├── setup.py               # Plugin installation config
├── Makefile              # Common development tasks
├── doc-cli.sh            # Optional wrapper for Rust CLI
└── .claude/              # Claude Code skills and automation
    └── skills/           # Specialized maintenance skills
```

## Specialized Skills

The `.claude/skills/` directory contains specialized workflows for maintaining this MkDocs project:

- **sync-repo-docs**: Sync external repository READMEs to docs/repositories/
- **new-project-page**: Create new project documentation following the established template
- **check-project-updates**: Identify which GitHub repos have been updated recently
- **verify-docs**: Verify documentation quality (NO EMOJIS, proper formatting, etc.)
- **deploy-docs**: Deploy versioned documentation to GitHub Pages

These skills make routine maintenance tasks simple and ensure consistency with the project's patterns. See `.claude/skills/README.md` for detailed usage.

## Common Commands

### Development Workflow

```bash
# Setup (install dependencies and register plugin)
make setup

# Start development server
make serve
# OR directly:
PYTHONPATH=$(pwd) mkdocs serve

# Build static site
make build
# OR directly:
PYTHONPATH=$(pwd) mkdocs build
```

### Using the Rust CLI

The `doc-cli` binary provides a unified interface for common tasks:

```bash
# Interactive menu (if no arguments)
doc-cli

# Specific commands
doc-cli startup              # Setup dev environment and start server
doc-cli startup --draft-version 1.2.3  # Start with draft version
doc-cli bump-version         # Create new version tag
doc-cli deploy              # Deploy all versions
doc-cli deploy --force      # Force redeploy all versions
doc-cli help                # Show help

# Alternative: Use wrapper script
./doc-cli.sh
./doc-cli.sh startup
```

### Versioning

```bash
# Create new version (uses bump-version Rust tool)
doc-cli bump-version
# OR use bash script:
./scripts/bump-version.sh

# Versions are managed via Git tags and deployed with mike
# The CI/CD pipeline automatically deploys on tag push
```

### Running the AI Proxy (Development Only - NOT ENABLED IN PRODUCTION)

**⚠️ Important**: The AI chat feature is currently disabled in production builds. See **AGENTS.md** section "AI/RAG Security and Implementation Plan" for security requirements before enabling.

For local development/testing only:

```bash
# Requires GITHUB_TOKEN environment variable
export GITHUB_TOKEN="your_github_pat"

# Run with uv (recommended)
uv run python scripts/python/ai_proxy.py

# Server runs on 127.0.0.1:8765 by default
# Configure with HOST, PORT, AI_MODEL, AI_ENDPOINT env vars
```

The frontend UI (`docs/overrides/main.html`) and plugin injection (`mkdocs_plugins/ai_plugin.py`) are currently commented out.

## Important Constraints

### PYTHONPATH Requirement

**Critical**: When running `mkdocs serve` or `mkdocs build` directly (not via Makefile), you MUST set PYTHONPATH to include the current directory:

```bash
# Linux/macOS
export PYTHONPATH=$PYTHONPATH:$(pwd) && mkdocs serve

# Windows PowerShell
$env:PYTHONPATH="$env:PYTHONPATH;$(pwd)"; mkdocs serve
```

This ensures the custom plugin (`mkdocs_plugins/`) is discoverable. The Makefile handles this automatically.

### Installation Before Use

Always run `pip install -e .` after cloning or when plugin code changes. This registers the custom MkDocs plugin with the system.

## Development Guidelines

See **AGENTS.md** for comprehensive guidelines on:

- Workflow rules and commit standards
- Code style and standards (Python, Rust)
- Pull request conventions
- Software engineering laws and decision-making patterns
- DRY principle (knowledge vs code duplication)
- Working with AI assistants
- Documentation standards
- Testing approach

Key principles:
- **ABSOLUTELY NO EMOJIS** in documentation, code, or commits
- Follow Test-Driven Development where applicable
- Use Python 3.10+ with immutable patterns and pure functions
- Use Conventional Commits format (feat:, fix:, chore:, etc.)
- Code should be self-documenting (no comments explaining what code does)
- Run `make setup` and `make build` before pushing changes

## CI/CD Pipeline

### GitHub Actions

1. **Build Job** (`.github/workflows/github_pages.yml`):
   - Triggers on push to main, PRs, and manual dispatch
   - Ignores `.devcontainer/**` changes
   - Fetches complete git history for versioning
   - Installs Python dependencies and custom plugin
   - Determines latest version tag or defaults to "0.1.0"
   - Builds site with `mike deploy $VERSION latest --update-aliases`
   - Uploads artifact for Pages deployment

2. **Deploy Job**:
   - Deploys to GitHub Pages when build succeeds on main branch

3. **Super-Linter** (`.github/workflows/super-linter.yml`):
   - Runs on all pull requests
   - Validates code quality and standards

### Version Management

- Versions are created via Git tags (semantic versioning: major.minor.patch)
- `mike` manages multiple documentation versions on gh-pages branch
- Latest tag is automatically deployed as "latest" alias
- Manual version creation: Use `doc-cli bump-version` or `./scripts/bump-version.sh`

## Plugins and Extensions

### MkDocs Plugins (mkdocs.yml)

- `awesome-nav`: Navigation enhancement
- `git-authors`: Show email and author info
- `git-revision-date-localized`: Display last updated dates
- `mike`: Version management
- `panzoom`: Image zoom functionality
- `glightbox`: Lightbox for images
- `print-site`: Print-friendly version
- `search`: Built-in search
- `tags`: Content tagging
- `minify`: HTML/JS/CSS minification

### Markdown Extensions

- `pymdownx.highlight`: Syntax highlighting with line numbers
- `pymdownx.superfences`: Code blocks with custom fences (mermaid diagrams)
- `pymdownx.tabbed`: Tabbed content
- `pymdownx.emoji`: Emoji support with Material icons
- `admonition`: Callout boxes
- `pymdownx.details`: Collapsible sections
- `attr_list`, `md_in_html`: Advanced HTML/CSS in markdown

## AI Assistant Guidelines

This repository uses **AGENTS.md** as the standard file for AI assistant and LLM guidelines. This follows an emerging pattern across modern AI CLI tools where a single AGENTS.md file provides:

- Repository workflow rules and commit standards
- Development guidelines optimized for LLM-assisted workflows
- Software engineering principles and decision-making patterns
- Code standards and style guidelines

See **AGENTS.md** for the complete guide. This file (CLAUDE.md) focuses on architecture, commands, and technical setup.

## Troubleshooting

### doc-cli: command not found

1. Open repository in Dev Container, OR
2. Run: `bash .devcontainer/scripts/setup-dev-environment.sh`
3. This installs the binary via Cargo and creates a `./doc-cli` shim

### Permission denied: ./doc-cli

```bash
chmod +x ./doc-cli
```

### Plugin not found errors

```bash
# Ensure plugin is installed
pip install -e .

# Verify installation
python -c "import mkdocs_plugins; print(mkdocs_plugins.__file__)"
```

### AI Proxy not starting

- Ensure `GITHUB_TOKEN` environment variable is set with a PAT that has models access
- Check Python dependencies: `pip install -r requirements.txt`
- Verify endpoint and model configuration via AI_ENDPOINT and AI_MODEL env vars

## Testing

This project currently does not have automated tests. When adding tests:
- Follow TDD principles (test first, then implementation)
- Use pytest for Python code
- Use cargo test for Rust code
- Maintain 100% coverage for business logic

## WSL Compatibility Note

There are known issues with the doc-cli tool in WSL environments. If you encounter problems, run the documentation server directly using `mkdocs serve`.