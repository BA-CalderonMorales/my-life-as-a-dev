# Skill: Version and Deploy

Deploy versioned documentation to GitHub Pages using Zensical.

## When to Use

- Deploying updates to production
- Releasing a new documentation version
- Managing version history on gh-pages
- Cleaning up old versions

## Deployment Overview

The site is built with **Zensical** and deployed to GitHub Pages. Versioned documentation uses `versioned_deploy.py` for multi-version support.

| Component | Technology |
|-----------|------------|
| Build | Zensical (~0.5-3s builds) |
| Hosting | GitHub Pages (gh-pages branch) |
| Versioning | `versioned_deploy.py` with mike-style structure |
| CI/CD | GitHub Actions |

## Version Naming Convention

Use `0.x.y` format (no `v` prefix):

- **Major** (0.x.0 -> 1.0.0): Breaking changes
- **Minor** (0.3.0 -> 0.4.0): New features
- **Patch** (0.3.0 -> 0.3.1): Bug fixes

Current convention: Stay in `0.x.y` during active development.

## Versioned Deployment Workflow

### 1. Build the Site

```bash
make build
```

### 2. Deploy a New Version

```bash
uv run python scripts/python/versioned_deploy.py 0.3.1 --alias latest --push
```

Options:
- `--alias latest`: Sets this version as the default
- `--push`: Automatically pushes to gh-pages
- Without `--push`: Preview changes locally first

### 3. Update versions.json

The script automatically updates `versions.json`. Structure:

```json
[
  {
    "version": "0.3.1",
    "title": "0.3.1",
    "aliases": ["latest"]
  }
]
```

## Automatic Deployment (CI/CD)

The GitHub Actions workflow (`.github/workflows/github_pages.yml`) handles automatic deployment on push to `main`. For versioned releases, use the manual workflow.

## Manual gh-pages Cleanup

When you need to remove old versions:

### 1. Create a Worktree

```bash
git worktree add /tmp/gh-pages-cleanup gh-pages
cd /tmp/gh-pages-cleanup
```

### 2. List and Remove Old Versions

```bash
# List version directories
ls -la | grep -E '^d.*[0-9]+\.[0-9]+\.[0-9]+'

# Remove old versions
rm -rf 0.3.0 v0.2.0 # etc.
```

### 3. Update versions.json

Edit `versions.json` to remove old version entries.

### 4. Commit and Push

```bash
git add -A
git commit -m "chore: clean up old versions, keep 0.3.1"
git push origin gh-pages
```

### 5. Clean Up Worktree

```bash
cd /workspaces/my-life-as-a-dev
git worktree remove /tmp/gh-pages-cleanup
```

## Local Preview

Before deploying, preview locally:

```bash
# Build and serve with Zensical
make serve

# Or direct
uv run zensical serve
```

## Version Selector Features

The version selector (`/docs/assets/js/version-selector.js`) includes:

- Dropdown with all available versions
- "Back to latest" banner when viewing old versions
- Automatic redirect support via `latest` alias

## Troubleshooting

### versions.json 404 on Versioned Pages

The `getBaseUrl()` function in `version-selector.js` must return the repository root, not the versioned path:

```javascript
// Correct: /my-life-as-a-dev/
// Wrong: /my-life-as-a-dev/0.3.1/
```

### Build Fails in CI

Check GitHub Actions logs:
1. Go to Actions tab
2. Click on failed workflow run
3. Expand "Build site with Zensical" step

Common issues:
- Missing files in sparse-checkout
- Invalid TOML in `zensical.toml`

### Site Not Updating

1. Check if workflow completed successfully
2. Clear browser cache (Ctrl+Shift+R)
3. Wait a few minutes for CDN propagation

### Old Versions Still Visible

1. Check gh-pages branch directly
2. Use worktree method to clean up
3. Verify `versions.json` matches directory structure

## Checklist

- [ ] All changes committed and pushed to main
- [ ] Build succeeds locally (`make build`)
- [ ] Version deployed with `versioned_deploy.py`
- [ ] `versions.json` has correct version with `latest` alias
- [ ] Old versions cleaned up if needed
- [ ] Live site verified: https://ba-calderonmorales.github.io/my-life-as-a-dev/
