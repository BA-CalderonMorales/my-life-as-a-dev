# Skill: Doc-CLI Usage

Use the Rust-based documentation CLI for common tasks.

## When to Use

- Starting development environment
- Building documentation
- Deploying documentation
- Bumping versions
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
3. bump-version - Create new version
4. deploy - Publish to GitHub Pages
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

### help

Show available commands:

```bash
./doc-cli.sh help
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
# Kill existing servers
pkill -f zensical
pkill -f mkdocs

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
| First time setup | `make setup` |
| New version | `./doc-cli.sh bump-version` |
| Deploy | `./doc-cli.sh deploy` |
| MkDocs (legacy) | `./doc-cli.sh mkdocs-serve --local` |

## Checklist

- [ ] Wrapper script exists: `./doc-cli.sh`
- [ ] Running from project root
- [ ] Virtual environment active (for Python operations)
