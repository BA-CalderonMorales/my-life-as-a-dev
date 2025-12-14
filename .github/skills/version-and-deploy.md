# Skill: Version and Deploy

Deploy documentation to GitHub Pages using Zensical.

## When to Use

- Deploying updates to production
- Releasing a new documentation version
- Managing version history

## Deployment Overview

The site is built with **Zensical** and deployed to GitHub Pages automatically via GitHub Actions.

| Component | Technology |
|-----------|------------|
| Build | Zensical (~0.4s builds) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

## Automatic Deployment

Every push to `main` triggers automatic deployment:

1. GitHub Actions runs `.github/workflows/github_pages.yml`
2. Zensical builds the site
3. Site is deployed to GitHub Pages

No manual steps required for regular updates.

## Manual Deployment

Using doc-cli:

```bash
# Interactive mode
./doc-cli.sh

# Or direct command
./doc-cli.sh deploy
```

## Version Bump Workflow

### 1. Bump Version

```bash
# Using doc-cli
./doc-cli.sh bump-version
```

This will:
- Prompt for version type (major, minor, patch)
- Update `versions.json`
- Create git tag
- Push changes (triggers automatic deployment)

### 2. Using Helper Script

```bash
./scripts/bump-version.sh
```

## Version Naming

Follow semantic versioning:
- **Major** (1.0.0 -> 2.0.0): Breaking changes
- **Minor** (1.0.0 -> 1.1.0): New features
- **Patch** (1.0.0 -> 1.0.1): Bug fixes

## GitHub Actions Workflow

The workflow (`.github/workflows/github_pages.yml`) does:

```yaml
# Simplified flow
- Checkout repository (sparse)
- Install zensical
- Build with zensical
- Deploy to GitHub Pages
```

Triggers:
- Push to `main` branch
- Pull requests (preview only)
- Manual workflow dispatch

## Force Redeploy

If needed:

```bash
./doc-cli.sh deploy --force
```

Or via GitHub Actions:
1. Go to Actions tab
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## Local Preview

Before deploying, preview locally:

```bash
# Build and serve with Zensical
make zen-serve

# Or
./doc-cli.sh zen-serve
```

## Troubleshooting

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
2. Clear browser cache
3. Wait a few minutes for CDN propagation

## Checklist

- [ ] All changes committed and pushed
- [ ] Build succeeds locally (`make zen-build`)
- [ ] GitHub Actions completed successfully
- [ ] Live site verified: https://ba-calderonmorales.github.io/my-life-as-a-dev/
