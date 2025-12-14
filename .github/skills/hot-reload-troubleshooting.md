# Skill: Hot Reload Troubleshooting

Diagnose and fix MkDocs hot reload issues during local development.

## When to Use

- Hot reload stops working (changes not reflected in browser)
- Browser shows stale content after file saves
- Server crashes after file changes
- Livereload connection drops frequently
- Changes to plugins or templates not picked up

## Quick Diagnosis

```bash
# Check if server is running
ps aux | grep mkdocs

# Restart with clean slate
pkill -f mkdocs
make serve

# If still broken, use clean mode (no dirty cache)
make serve-clean

# Using doc-cli instead of make:
./doc-cli startup --local          # Normal mode (fast, dirty)
./doc-cli startup --local --clean  # Clean mode (full rebuilds)
```

## Common Issues and Fixes

### 1. Dirty Mode Cache Issues

**Symptoms**: Changes not appearing, navigation broken, stale content

**Cause**: `--dirty` flag keeps cache that can become stale

**Fix**: Use clean rebuild mode

```bash
# Switch to clean mode (slower but reliable)
make serve-clean

# Or restart with explicit clean
pkill -f mkdocs
rm -rf site/
make serve
```

### 2. Custom Directories Not Watched

**Symptoms**: Changes to plugins, templates, or scripts not triggering reload

**Cause**: MkDocs only watches `docs/` by default

**Fix**: Already configured in `mkdocs.yml`:

```yaml
watch:
  - mkdocs_plugins
  - docs/overrides
  - scripts/python
```

To add more directories:

```yaml
watch:
  - mkdocs_plugins
  - docs/overrides
  - scripts/python
  - your_directory_here
```

### 3. navigation.instant Interference

**Symptoms**: Page changes load but don't show new content, need hard refresh

**Cause**: `navigation.instant` intercepts clicks and can cache page content

**Fix**: Hard refresh the browser

```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

Or temporarily disable in `mkdocs.yml`:

```yaml
theme:
  features:
    # - navigation.instant  # Comment out for debugging
    # - navigation.instant.progress
```

### 4. Minify Plugin Conflicts

**Symptoms**: CSS/JS changes not appearing, browser console errors

**Cause**: Minification can cache aggressively during development

**Fix**: The minify plugin should only affect production. For debugging:

```bash
# Build without minification
PYTHONPATH=$(pwd) mkdocs serve --no-directory-urls
```

### 5. Port Already in Use

**Symptoms**: "Address already in use" error, server won't start

**Fix**:

```bash
# Kill existing processes
pkill -f mkdocs
pkill -f "python.*serve"

# Or use different port
MKDOCS_DEV_ADDR=127.0.0.1:8001 make serve
```

### 6. WebSocket Connection Failures

**Symptoms**: "Livereload connection closed" in browser console

**Cause**: Firewall, proxy, or codespace networking issues

**Fix for Codespaces/Remote**:

```bash
# Bind to all interfaces
MKDOCS_DEV_ADDR=0.0.0.0:8000 make serve
```

Check VS Code port forwarding tab - ensure port 8000 is forwarded.

### 7. Large Site Slow Rebuilds

**Symptoms**: 20+ second rebuilds, changes take forever to appear

**Cause**: Full site rebuild on each change

**Fix**: Use dirty mode (default) and ensure `--watch-theme`:

```bash
make serve  # Uses --dirty --watch-theme
```

For even faster iteration on a single page:

```bash
# Edit just one file and force rebuild
touch docs/your-page.md
```

### 8. Python Import Errors on Reload

**Symptoms**: Server crashes with ImportError after plugin changes

**Cause**: Plugin module not reloaded properly

**Fix**:

```bash
# Full restart required for plugin changes
pkill -f mkdocs
make serve
```

For frequent plugin development, run the proxy separately:

```bash
# Terminal 1: Run MkDocs
make serve

# Terminal 2: Edit plugins, then restart Terminal 1
```

## Diagnostic Commands

```bash
# Check what's being watched
grep -A 5 "^watch:" mkdocs.yml

# Check server output for errors
make serve 2>&1 | tee mkdocs.log

# Verify plugin installation
pip show mkdocs-material mkdocs

# Check for zombie processes
ps aux | grep -E "mkdocs|python.*serve"

# Nuclear option: full reset
pkill -f mkdocs
rm -rf site/ .cache/
make setup
make serve
```

## Environment-Specific Issues

### GitHub Codespaces

1. Use `0.0.0.0` binding: `MKDOCS_DEV_ADDR=0.0.0.0:8000 make serve`
2. Check Ports tab in VS Code - ensure port is forwarded
3. Use the forwarded URL, not localhost

### Docker/Dev Containers

1. Ensure port is exposed in devcontainer.json
2. May need to disable livereload: `mkdocs serve --no-livereload`
3. Volume mounts can delay file change detection

### WSL

1. File system events may be delayed across Windows/Linux boundary
2. Keep project files in WSL filesystem (`/home/...`) not Windows mount (`/mnt/c/...`)

## Prevention Checklist

- [ ] Use `make serve` for normal development
- [ ] Use `make serve-clean` when hot reload misbehaves
- [ ] Kill old servers before starting new ones
- [ ] Add custom directories to `watch:` in mkdocs.yml
- [ ] Hard refresh browser if content seems stale
- [ ] Restart server after plugin changes

## Related Skills

- [Build and Test](build-and-test.md) - Build commands and validation
- [Code Standards](code-standards.md) - Plugin development guidelines
