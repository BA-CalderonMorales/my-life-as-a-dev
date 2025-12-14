# Skill: Version and Deploy

Create new documentation versions and deploy to GitHub Pages.

## When to Use

- Releasing a new documentation version
- Deploying updates to production
- Managing version history

## Tools

- **mike**: MkDocs versioning plugin
- **doc-cli**: Rust CLI wrapper for common tasks

## Quick Deploy (Most Common)

Using doc-cli:

```bash
# Interactive mode
doc-cli

# Or direct command
doc-cli deploy
```

## Version Bump Workflow

### 1. Bump Version

```bash
# Using helper script
./scripts/bump-version.sh

# Or using doc-cli
doc-cli bump-version
```

This will:
- Prompt for version type (major, minor, patch)
- Update `versions.json`
- Create git tag
- Trigger GitHub Actions deploy

### 2. Manual Version Creation

```bash
# Build and deploy specific version
mike deploy 1.2.0 latest --update-aliases

# Set default version
mike set-default latest
```

### 3. List Versions

```bash
mike list
```

## Version Naming

Follow semantic versioning:
- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features
- **Patch** (1.0.0 → 1.0.1): Bug fixes

## GitHub Actions

The deploy workflow (`.github/workflows/github_pages.yml`) automatically:
- Builds documentation
- Deploys to GitHub Pages
- Updates version aliases

Triggers:
- Push to `main` with version tag
- Manual workflow dispatch

## Force Redeploy

If needed:

```bash
doc-cli deploy --force
```

Or via GitHub Actions:
1. Go to Actions tab
2. Select deploy workflow
3. Run workflow manually

## Rollback

To revert to previous version:

```bash
# List versions
mike list

# Delete problematic version
mike delete 1.2.0

# Redeploy previous as latest
mike deploy 1.1.0 latest --update-aliases
```

## Local Preview of Versioned Site

```bash
mike serve
```

Opens versioned site at http://localhost:8000

## Checklist

- [ ] All changes committed
- [ ] Build succeeds locally
- [ ] Version number determined
- [ ] `versions.json` updated
- [ ] Tag created and pushed
- [ ] GitHub Actions completed
- [ ] Live site verified
