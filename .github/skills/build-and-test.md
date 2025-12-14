# Skill: Build and Test Documentation

Build, test, and serve the documentation site using Zensical (recommended) or MkDocs.

## When to Use

- Before committing documentation changes
- After adding or modifying pages
- Debugging build errors
- Previewing changes locally

## Quick Commands

```bash
# Build and serve with Zensical (recommended, 20x faster)
make zen-serve

# Or using doc-cli
./doc-cli.sh zen-serve

# Build only (no serve)
make zen-build
```

### Legacy MkDocs Commands

```bash
# Serve with MkDocs (legacy, slower)
make serve

# Build with MkDocs
make build
```

## Build Systems Comparison

| System | Build Time | Use Case |
|--------|------------|----------|
| Zensical | ~0.4s | Primary development, production |
| MkDocs | ~8s | Legacy support, versioning with mike |

## Build Process

### 1. Setup (First Time)

```bash
make setup
```

This installs:
- Python dependencies from `requirements.txt`
- Zensical and MkDocs
- Local plugins from `mkdocs_plugins/` (editable install)

### 2. Build

```bash
# Zensical (recommended)
make zen-build

# MkDocs (legacy)
make build
```

Output goes to `site/` directory. Build will:
- Compile all markdown to HTML
- Process navigation structure
- Validate internal links

### 3. Serve Locally

```bash
# Zensical on port 8001 (recommended)
make zen-serve

# MkDocs on port 8000 (legacy)
make serve
```

Zensical features:
- Blazing fast rebuilds (~0.4s)
- Hot reload on file changes
- Modern architecture

If MkDocs hot reload stops working, use `make serve-clean` or see [Hot Reload Troubleshooting](hot-reload-troubleshooting.md).

## Using Doc-CLI

The doc-cli provides an interactive menu:

```bash
./doc-cli.sh
```

Available commands:
- `zen-serve` - Start Zensical dev server (port 8001)
- `zen-build` - Build with Zensical
- `startup` - Start MkDocs dev server (legacy)

## Environment Variables

```bash
# Custom Zensical server address
ZENSICAL_DEV_ADDR=0.0.0.0:8080 make zen-serve

# Custom MkDocs server address
MKDOCS_DEV_ADDR=0.0.0.0:8080 make serve
```

## Troubleshooting

### "Page not in nav" Warning

Expected for problem sub-pages. These are linked from parent pages, not nav.

### Port Already in Use

```bash
# Kill existing server
pkill -f zensical
pkill -f mkdocs

# Then restart
make zen-serve
```

### Import Errors (MkDocs only)

```bash
# Ensure PYTHONPATH is set
export PYTHONPATH=$PYTHONPATH:$(pwd)
make build
```

## Checklist

- [ ] Run `make setup` if dependencies changed
- [ ] Run `make zen-build` to validate
- [ ] Check for ERROR messages
- [ ] Run `make zen-serve` to preview
- [ ] Verify navigation works
- [ ] Check responsive layout
