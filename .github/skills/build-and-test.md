# Skill: Build and Test Documentation

Build, test, and serve the MkDocs documentation site.

## When to Use

- Before committing documentation changes
- After adding or modifying pages
- Debugging build errors
- Previewing changes locally

## Quick Commands

```bash
# Full setup (first time or after dependency changes)
make setup

# Build site (validates all pages)
make build

# Serve locally with hot reload
make serve

# Build with strict mode (catches all warnings as errors)
PYTHONPATH=$(pwd) mkdocs build --strict
```

## Build Process

### 1. Setup (First Time)

```bash
make setup
```

This installs:
- Python dependencies from `requirements.txt`
- Local plugins from `mkdocs_plugins/` (editable install)

### 2. Build

```bash
make build
```

Output goes to `site/` directory. Build will:
- Compile all markdown to HTML
- Process plugins (git dates, search, etc.)
- Validate internal links
- Report missing nav entries

### 3. Serve Locally

```bash
make serve
```

Opens at http://127.0.0.1:8000 with:
- Hot reload on file changes
- Fast rebuilds (dirty mode)
- Theme watching

## Environment Variables

```bash
# Custom server address
MKDOCS_DEV_ADDR=0.0.0.0:8080 make serve

# Enable git authors plugin (slow, disabled by default)
ENABLE_GIT_AUTHORS=true make build

# Enable print site plugin
ENABLE_PRINT_SITE=true make build
```

## Troubleshooting

### "Page not in nav" Warning

Expected for problem sub-pages. These are linked from parent pages, not nav.

### "No git logs" Warning

Normal for new files not yet committed.

### Import Errors

```bash
# Ensure PYTHONPATH is set
export PYTHONPATH=$PYTHONPATH:$(pwd)
make build
```

### Plugin Errors

```bash
# Reinstall local plugins
uv pip install -e .
```

## Strict Mode

For CI-like validation:

```bash
PYTHONPATH=$(pwd) mkdocs build --strict 2>&1 | grep -E "ERROR|WARNING"
```

## Checklist

- [ ] Run `make setup` if dependencies changed
- [ ] Run `make build` to validate
- [ ] Check for ERROR messages
- [ ] Run `make serve` to preview
- [ ] Verify navigation works
- [ ] Check responsive layout
