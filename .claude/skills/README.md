# MkDocs Documentation Skills

Specialized skills for maintaining this MkDocs Material documentation hub.

## Available Skills

### sync-repo-docs
Sync external repository READMEs to docs/repositories/ using Python automation scripts. Handles caching, inactivity warnings, and maintains the NO EMOJIS rule.

**Use when**: External GitHub repositories have been updated and need their READMEs pulled into the documentation.

### new-project-page
Create new project documentation following the established 3-tier template (Overview/Quick Start/Details) with proper Material Design patterns and emotional minimalism aesthetic.

**Use when**: Adding a new project to the documentation hub.

### check-project-updates
Identify which GitHub repositories have been updated recently to determine if documentation needs refreshing. Provides update thresholds and decision matrix.

**Use when**: Regular maintenance check or before syncing repository documentation.

### verify-docs
Verify documentation quality before deployment. Checks for emojis (CRITICAL), build success, navigation links, style consistency, and Material icon usage.

**Use when**: Before committing changes or deploying to production.

### deploy-docs
Deploy versioned documentation to GitHub Pages using doc-cli and mike. Handles version management, CI/CD integration, and rollback procedures.

**Use when**: Ready to publish documentation changes to production.

## Quick Reference

| Task | Skill |
|------|-------|
| Pull latest READMEs from GitHub | sync-repo-docs |
| Add new project documentation | new-project-page |
| Check which repos updated | check-project-updates |
| Pre-commit verification | verify-docs |
| Publish to GitHub Pages | deploy-docs |

## Core Principles

All skills enforce:
- **NO EMOJIS** - Use Material icons (`:material-icon-name:`)
- **Emotional minimalism** - Light typography, clean spacing
- **3-tier structure** - Overview/Quick Start/Details
- **Material Design** - Grid cards, admonitions, tabs
- **Conventional Commits** - feat:/fix:/chore: prefixes
- **Version management** - Semantic versioning with git tags

## Workflow Integration

### Daily Maintenance
```bash
# 1. Check for updates
Use: check-project-updates

# 2. Sync if needed
Use: sync-repo-docs

# 3. Verify quality
Use: verify-docs
```

### Adding New Project
```bash
# 1. Create pages
Use: new-project-page

# 2. Verify
Use: verify-docs

# 3. Commit
git commit -m "feat: add PROJECT documentation"
```

### Deployment
```bash
# 1. Pre-deployment checks
Use: verify-docs

# 2. Deploy
Use: deploy-docs
```

## Critical Rules

1. **NEVER use emojis** in documentation, code, or commits
2. **ALWAYS run verify-docs** before committing
3. **ALWAYS set PYTHONPATH** when running scripts directly
4. **ALWAYS follow Conventional Commits** format
5. **ALWAYS maintain 3-tier doc structure** for projects

## Common Commands

```bash
# Setup environment
make setup

# Start dev server
make serve

# Build documentation
make build

# Run doc-cli
doc-cli
```

## Integration with Existing Tools

These skills complement:
- **doc-cli** (Rust): startup, bump-version, deploy commands
- **Python scripts**: utils.py, generate_repo_pages.py, verify_page.py
- **Makefile**: setup, serve, build targets
- **GitHub Actions**: Automated deployment pipeline

## Maintenance Philosophy

Documentation deserves the same care as code:
- Version it (git + mike)
- Test it (verify_page.py)
- Review it (PR process)
- Deploy it (CI/CD)

These skills make this philosophy easy to follow.
