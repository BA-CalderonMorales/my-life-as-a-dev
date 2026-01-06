# Skill: Doc-CLI Usage

Use the Rust-based documentation CLI for common tasks.

## When to Use

- Starting development environment
- Building documentation
- Deploying documentation
- Bumping versions
- Validating site configuration (agents)
- Checking navigation coverage (agents)
- Understanding project structure (agents)
- Any routine documentation task

## Running Doc-CLI

```bash
# Recommended: wrapper script (builds if needed)
./doc-cli.sh

# Or direct binary (if already built)
./scripts/rust/target/release/doc-cli
```

## Interactive Mode

Run without arguments for interactive menu:

```bash
./doc-cli.sh
```

Shows menu:
1. serve - Start Zensical dev server (primary)
2. build - Build with Zensical
3. kill - Stop running servers
4. bump-version - Create new version
5. deploy - Publish to GitHub Pages
6. info - Show project structure (useful for agents)
7. validate - Validate configuration
8. nav-check - Check navigation coverage
h. help - Show commands

## Commands

### serve (Primary)

Start Zensical development server:

```bash
./doc-cli.sh serve
```

Features:
- 20x faster builds than MkDocs
- Hot reload on file changes
- Runs on port 8001

### build

Build site with Zensical:

```bash
./doc-cli.sh build
```

Output goes to `site/` directory.

### kill

Stop running Zensical/MkDocs processes:

```bash
./doc-cli.sh kill
```

Kills processes by name and frees ports 8000/8001. Useful before restarting:

```bash
./doc-cli.sh kill && ./doc-cli.sh serve
```

### mkdocs-serve (Legacy)

Start MkDocs development server:

```bash
# In Codespaces (auto-detected)
./doc-cli.sh mkdocs-serve

# Local development
./doc-cli.sh mkdocs-serve --local

# With full rebuilds (when hot reload misbehaves)
./doc-cli.sh mkdocs-serve --local --clean
```

Options:
- `--local` - Required for local development (outside Codespaces)
- `--clean` - Use full rebuilds instead of dirty mode (slower but reliable)

### bump-version

Create new documentation version:

```bash
./doc-cli.sh bump-version
```

Prompts for:
- Version type (major/minor/patch)
- Confirmation

### deploy

Deploy to GitHub Pages:

```bash
./doc-cli.sh deploy

# Force redeploy
./doc-cli.sh deploy --force
```

### info (Agent Command)

Show project structure and configuration info:

```bash
./doc-cli.sh info
```

Displays:
- Project paths (root, docs, overrides, stylesheets)
- Configuration file status (zensical.toml, mkdocs.yml)
- Key directory status
- Markdown file count
- Tips for agents

### validate (Agent Command)

Validate site configuration:

```bash
./doc-cli.sh validate
```

Checks:
- zensical.toml syntax and required fields
- docs directory structure
- Required files (index.md, overrides, stylesheets)

Returns exit code 1 on errors.

### nav-check (Agent Command)

Check for markdown files not in navigation:

```bash
./doc-cli.sh nav-check
```

Reports:
- Total markdown files found
- Files referenced in navigation
- Orphaned files not in nav

Useful for ensuring all pages are accessible.

### help

Show available commands:

```bash
./doc-cli.sh help
```

## Agent Workflow

When working on this repository, agents should:

1. Run `info` first to understand project structure
2. Run `validate` to check configuration
3. Run `nav-check` after adding new pages
4. Run `build` to verify changes compile

```bash
# Typical agent workflow
./doc-cli.sh info
./doc-cli.sh validate
# ... make changes ...
./doc-cli.sh nav-check
./doc-cli.sh build
```

## Building Doc-CLI

The wrapper script builds automatically, but if needed:

```bash
cd scripts/rust
cargo build --release
```

Binary location: `scripts/rust/target/release/doc-cli`

## Troubleshooting

### Command Not Found

```bash
# Use wrapper script
./doc-cli.sh

# Or full path to binary
./scripts/rust/target/release/doc-cli
```

### Build Errors

```bash
cd scripts/rust
cargo clean
cargo build --release
```

### Port Already in Use

```bash
# Use kill command
./doc-cli.sh kill

# Then restart
./doc-cli.sh serve
```

### WSL Issues

If doc-cli misbehaves on WSL, use make commands directly:

```bash
make setup
make serve
```

## When to Use What

| Task | Command |
|------|---------|
| Daily development | `./doc-cli.sh serve` or `make serve` |
| Build only | `./doc-cli.sh build` or `make build` |
| Stop server | `./doc-cli.sh kill` |
| Restart server | `./doc-cli.sh kill && ./doc-cli.sh serve` |
| First time setup | `make setup` |
| New version | `./doc-cli.sh bump-version` |
| Deploy | `./doc-cli.sh deploy` |
| MkDocs (legacy) | `./doc-cli.sh mkdocs-serve --local` |
| Understand project (agents) | `./doc-cli.sh info` |
| Validate config (agents) | `./doc-cli.sh validate` |
| Check nav coverage (agents) | `./doc-cli.sh nav-check` |

## Configuration

This project uses modular configuration in `config/zensical/`:

| File | Purpose |
|------|---------|
| `01-site.toml` | Site name, URL, repo info |
| `02-assets.toml` | CSS, JS, and static files |
| `03-navigation.toml` | Navigation structure |
| `04-theme.toml` | Colors, fonts, features |
| `05-markdown.toml` | Markdown extensions |
| `06-plugins.toml` | Search, tags, etc. |
| `07-development.toml` | Watch, strict mode |

These merge into `zensical.toml` automatically during `serve` and `build`.

### Legacy Config

| File | Purpose | When to Use |
|------|---------|-------------|
| `zensical.toml` | Merged config (auto-generated) | Read-only, generated from above |
| `mkdocs.yml` | Legacy config for MkDocs | MkDocs compatibility only |

**Always edit files in `config/zensical/`** - never edit `zensical.toml` directly.

## Checklist

- [ ] Wrapper script exists: `./doc-cli.sh`
- [ ] Running from project root
- [ ] Virtual environment active (for Python operations)
