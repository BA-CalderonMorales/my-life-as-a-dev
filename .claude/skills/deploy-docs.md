# Deploy Documentation

**Purpose**: Deploy versioned documentation to GitHub Pages using the doc-cli tool and mike versioning system.

## Prerequisites

- All changes committed to git
- Documentation verified (see verify-docs skill)
- On correct git branch (typically main or develop)
- doc-cli binary installed (via Dev Container or setup script)

## Deployment Methods

### Method 1: Using doc-cli (Recommended)

The Rust CLI provides a unified deployment interface:

```bash
# Interactive menu (if available)
doc-cli

# Direct deployment command
doc-cli deploy

# Force redeploy all versions
doc-cli deploy --force
```

This handles:
- Determining latest version tag
- Building with mike
- Deploying to gh-pages branch
- Updating version aliases

### Method 2: Using Bash Script

```bash
./scripts/deploy-docs.sh
```

### Method 3: Manual mike Deployment

```bash
# Get latest version tag
LATEST_VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "0.1.0")

# Deploy with mike
PYTHONPATH=$(pwd) mike deploy $LATEST_VERSION latest --update-aliases

# Set default version
mike set-default latest

# Push to GitHub Pages
git push origin gh-pages
```

## Version Management

### Creating New Version

Use the bump-version command:

```bash
# Using doc-cli
doc-cli bump-version

# Using bash script
./scripts/bump-version.sh
```

This creates a semantic version tag (major.minor.patch).

### Version Workflow

1. Make documentation changes on feature branch
2. Commit changes: `feat: update project documentation`
3. Merge to main branch
4. Create new version: `doc-cli bump-version`
5. Push tag: `git push origin --tags`
6. CI/CD automatically deploys to GitHub Pages

### Manual Version Creation

```bash
# Create tag
git tag -a v1.2.3 -m "Release version 1.2.3"

# Push tag (triggers CI/CD deployment)
git push origin v1.2.3
```

## CI/CD Automated Deployment

GitHub Actions automatically deploys when:
- Push to main branch
- New version tag pushed
- Manual workflow dispatch

Pipeline (`.github/workflows/github_pages.yml`):

```yaml
1. Checkout with full git history
2. Set up Python
3. Install dependencies (make setup)
4. Determine latest version
5. Build: mike deploy $VERSION latest --update-aliases
6. Deploy to GitHub Pages
```

## Deployment Verification

After deployment:

1. Check GitHub Pages URL: https://ba-calderonmorales.github.io/my-life-as-a-dev/
2. Verify version selector shows correct versions
3. Check "latest" alias points to newest version
4. Test navigation across all sections
5. Verify no broken links or missing pages

## Version Management Commands

```bash
# List all deployed versions
mike list

# Delete a version
mike delete VERSION

# Set default version
mike set-default VERSION

# Serve locally to preview versions
mike serve
```

## Rollback Procedure

If deployment has issues:

```bash
# Deploy previous version as latest
mike deploy PREVIOUS_VERSION latest --update-aliases

# Or delete problematic version
mike delete PROBLEMATIC_VERSION

# Force push to gh-pages
git push origin gh-pages --force
```

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Plugin not found | PYTHONPATH not set | Run `make setup` first |
| Version not found | No git tags | Create tag: `git tag v0.1.0` |
| Deploy fails | Uncommitted changes | Commit or stash changes |
| gh-pages conflict | Branch out of sync | Force push after verification |
| 404 on GitHub Pages | Deployment not complete | Wait 5 minutes, check Actions tab |

## Pre-Deployment Checklist

- [ ] Run `make setup`
- [ ] Run `make build` successfully
- [ ] Verify no emojis (see verify-docs skill)
- [ ] All changes committed
- [ ] On correct branch (main/develop)
- [ ] Version tag exists or will be created
- [ ] CI/CD pipeline is passing
- [ ] Reviewed changes locally: `make serve`

## Workflow Summary

**For feature work**:
```bash
# 1. Make changes
# 2. Verify
make setup
make build
PYTHONPATH=$(pwd) python scripts/python/verify_page.py

# 3. Commit
git add .
git commit -m "feat: update documentation"

# 4. Push
git push origin feature-branch

# 5. Create PR and merge to main
```

**For release**:
```bash
# 1. Create version
doc-cli bump-version

# 2. Push tag
git push origin --tags

# 3. CI/CD handles deployment automatically
```

## Expected Outcome

Documentation successfully deployed to GitHub Pages with:
- Correct version tag
- Updated "latest" alias
- All pages rendering correctly
- Version selector functional
- No broken links
- Zero emojis
- Emotional minimalism aesthetic preserved
