# Skill: Doc-CLI Usage

Use the Rust-based documentation CLI for common tasks.

## When to Use

- Starting development environment
- Deploying documentation
- Bumping versions
- Any routine documentation task

## Running Doc-CLI

```bash
# From project root
doc-cli

# Or using wrapper script
./doc-cli.sh

# Or direct binary
./scripts/rust/target/release/doc-cli
```

## Interactive Mode

Run without arguments for interactive menu:

```bash
doc-cli
```

Shows menu:
1. Startup - Setup and serve
2. Bump Version - Create new version
3. Deploy - Publish to GitHub Pages
4. Help - Show commands

## Commands

### startup

Setup dependencies and start dev server:

```bash
# In Codespaces (auto-detected)
doc-cli startup

# Local development
doc-cli startup --local

# With full rebuilds (when hot reload misbehaves)
doc-cli startup --local --clean
```

Does:
- Installs Python dependencies
- Registers local plugins
- Starts MkDocs serve with hot reload

Options:
- `--local` - Required for local development (outside Codespaces)
- `--clean` - Use full rebuilds instead of dirty mode (slower but reliable)

### bump-version

Create new documentation version:

```bash
doc-cli bump-version
```

Prompts for:
- Version type (major/minor/patch)
- Confirmation

### deploy

Deploy to GitHub Pages:

```bash
doc-cli deploy

# Force redeploy
doc-cli deploy --force
```

### help

Show available commands:

```bash
doc-cli help
```

## Building Doc-CLI

If binary doesn't exist:

```bash
cd scripts/rust
cargo build --release
```

Binary location: `scripts/rust/target/release/doc-cli`

## Troubleshooting

### Command Not Found

```bash
# Use full path
./scripts/rust/target/release/doc-cli

# Or add to PATH
export PATH=$PATH:$(pwd)/scripts/rust/target/release
```

### Build Errors

```bash
cd scripts/rust
cargo clean
cargo build --release
```

### WSL Issues

If doc-cli misbehaves on WSL, use make commands directly:

```bash
make setup
make serve
```

## When to Use What

| Task | Use |
|------|-----|
| First time setup | `doc-cli startup` |
| Daily development | `make serve` |
| Building docs | `make build` |
| New version | `doc-cli bump-version` |
| Deploy | `doc-cli deploy` |

## Checklist

- [ ] Binary exists at expected path
- [ ] Running from project root
- [ ] Virtual environment active (for Python operations)
