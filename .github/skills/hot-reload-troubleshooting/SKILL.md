# Skill: Hot Reload Troubleshooting

Diagnose and fix hot reload issues during local development.

## When to Use

- Hot reload stops working (changes not reflected in browser)
- Browser shows stale content after file saves
- Server crashes after file changes
- Livereload connection drops frequently

## Quick Solution: Use Zensical

Zensical has faster, more reliable hot reload than MkDocs:

```bash
# Kill any existing servers
pkill -f zensical
pkill -f mkdocs

# Start Zensical (recommended)
make serve

# Or using doc-cli
./doc-cli.sh serve
```

Zensical rebuilds in ~0.4s vs ~8s for MkDocs, making hot reload feel instant.

## Quick Diagnosis

```bash
# Check if server is running
ps aux | grep -E "zensical|mkdocs"

# Kill and restart
pkill -f zensical
pkill -f mkdocs
make serve
```

## Common Issues and Fixes

### 1. Port Already in Use

**Symptoms**: Server fails to start with "Address already in use"

**Fix**:

```bash
# Kill existing servers
pkill -f zensical
pkill -f mkdocs

# Or kill by port
lsof -ti:8001 | xargs kill -9  # Zensical port
lsof -ti:8000 | xargs kill -9  # MkDocs port

# Restart
make serve
```

### 2. Zensical Hot Reload Issues

**Symptoms**: Changes not appearing after save

**Fix**:

```bash
# Clean build
zensical build --clean
make serve
```

### 3. Browser Caching

**Symptoms**: Page loads but shows old content

**Fix**: Hard refresh the browser

```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

## MkDocs-Specific Issues (Legacy)

If you must use MkDocs:

### Dirty Mode Cache Issues

**Symptoms**: Changes not appearing, navigation broken

**Fix**: Use clean rebuild mode

```bash
make serve-clean

# Or restart with explicit clean
pkill -f mkdocs
rm -rf site/
make serve
```

### Custom Directories Not Watched

**Symptoms**: Changes to plugins, templates not triggering reload

**Fix**: Already configured in mkdocs.yml:

```yaml
watch:
  - mkdocs_plugins
  - docs/overrides
  - scripts/python
```

### navigation.instant Interference

**Symptoms**: Page changes load but do not show new content

**Fix**: Hard refresh or temporarily disable in mkdocs.yml:

```yaml
theme:
  features:
    # - navigation.instant  # Comment out for debugging
```

## When to Switch Build Systems

| Issue | Solution |
|-------|----------|
| Slow rebuilds | Use Zensical |
| Hot reload unreliable | Use Zensical |
| Need mike versioning | Use MkDocs |
| Custom plugins | Use MkDocs |

## Recovery Steps

If nothing works:

```bash
# Nuclear option: full reset
pkill -f zensical
pkill -f mkdocs
rm -rf site/
rm -rf .cache/

# Clean Zensical build
zensical build --clean

# Restart
make serve
```

## Checklist

- [ ] Correct server running (check ps aux | grep -E "zensical|mkdocs")
- [ ] Port not in use by another process
- [ ] Browser cache cleared
- [ ] Files saved correctly
- [ ] No syntax errors in markdown
