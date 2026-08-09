# Skill: Build and Test Documentation

Build, test, and serve the documentation site using Zensical (recommended) or MkDocs.

## When to Use

- Before committing documentation changes
- After adding or modifying pages
- Debugging build errors
- Previewing changes locally
- After patching shared UI chrome such as headers, drawers, overlays, dropdowns, or global CSS/JS

## Quick Commands

```bash
# Build and serve with Zensical (primary, 20x faster)
make serve

# Or using doc-cli
./doc-cli.sh serve

# Build only (no serve)
make build
```

## Fast Paths

Choose the smallest verification path that still covers the risk of the change:

### Content-only edits

```bash
make build
```

### Single-page layout or styling edits

```bash
make build
# then preview the touched page locally
```

### Shared UI / global CSS / header / drawer / overlay / dropdown changes

```bash
make viewport-check
```

Use `make screenshots` when the visual design itself changed and image review is needed.

### Versioning or production release changes

Use the [Version and Deploy](../version-and-deploy/SKILL.md) skill after the local build/test pass is green.

### Legacy MkDocs Commands

```bash
# Serve with MkDocs (legacy, slower)
make mkdocs-serve

# Build with MkDocs
make mkdocs-build
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
# Zensical (primary)
make build

# MkDocs (legacy)
make mkdocs-build
```

Output goes to `site/` directory. Build will:
- Compile all markdown to HTML
- Process navigation structure
- Validate internal links

### 3. Serve Locally

```bash
# Zensical on port 8001 (primary)
make serve

# MkDocs on port 8000 (legacy)
make mkdocs-serve
```

Zensical features:
- Blazing fast rebuilds (~0.4s)
- Hot reload on file changes
- Modern architecture

If MkDocs hot reload stops working, use `make serve-clean` or see [Hot Reload Troubleshooting](hot-reload-troubleshooting.md).

## Shared UI Patch Workflow

When changing shared UI behavior, do not stop at `make build`. Run a focused regression pass on the shell elements most likely to break across pages.

### 1. Rebuild the shipped assets

```bash
make build
```

### 2. Run targeted browser checks first

```bash
make viewport-check
```

If visual polish changed, also run:

```bash
make screenshots
```

If a browser-backed test is blocked by sandbox restrictions or missing Chromium dependencies, rerun it with the needed approval instead of skipping it silently.

### 3. Sanity check the shared shell, not just the page you touched

For shared CSS/JS changes, verify at least:

- Home page plus one content page with sidebar navigation
- Mobile drawer opens with a crisp panel while the backdrop blur stays behind it
- Header controls remain clickable and are not trapped behind overlays or stacking contexts
- Version selector dropdown has an opaque background and older versions are clickable
- A fix on one shared element does not break another shared element in the same header or overlay stack

Use the [Browser Automation](../browser-automation/SKILL.md) skill when browser interaction is required.

## Using Doc-CLI

The doc-cli provides an interactive menu:

```bash
./doc-cli.sh
```

Available commands:
- `serve` - Start Zensical dev server (port 8001)
- `build` - Build with Zensical
- `mkdocs-serve` - Start MkDocs dev server (legacy)

## Environment Variables

```bash
# Custom Zensical server address
DEV_ADDR=0.0.0.0:8080 make serve
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
make serve
```

### Import Errors (MkDocs only)

```bash
# Ensure PYTHONPATH is set
export PYTHONPATH=$PYTHONPATH:$(pwd)
make build
```

### Browser-Level UI Test Is Blocked

If a regression test or visual check needs a real browser and the sandbox blocks it:

1. Run the build first so `site/` reflects the current patch
2. Use `make viewport-check`, `make screenshots`, or `make accessibility-check`
3. If Chromium needs missing OS dependencies outside the sandbox, request escalation and rerun the exact targeted check

## Checklist

- [ ] Run `make setup` if dependencies changed
- [ ] Run `make build` to validate
- [ ] Run targeted regression checks for any shared UI shell changes
- [ ] Check for ERROR messages
- [ ] Run `make serve` to preview
- [ ] Verify navigation and version selector interactions work
- [ ] Check responsive layout, especially mobile drawer and header interactions
