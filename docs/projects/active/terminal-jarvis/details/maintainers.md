---
comments: true
---

# Maintainer's Guide

This guide provides detailed instructions for maintainers to publish releases and manage the Terminal Jarvis project.

## Overview

Terminal Jarvis uses a **three-channel distribution strategy**:

1. **Cargo** (crates.io) - Rust ecosystem
2. **NPM** (npmjs.com) - Node.js ecosystem  
3. **Homebrew** (tap repository) - macOS/Linux package managers

## Release Workflow

### 1. Development and Testing

```bash
# Run validation without deployment
./scripts/cicd/local-ci.sh
```

**What local-ci.sh does**:


- Code formatting (`cargo fmt`)
- Linting (`cargo clippy`)
- Test suite (33 comprehensive tests)
- Version consistency validation
- Release binary build
- NPM package build
- **No commits, tags, or pushes**

### 2. Git Deployment and Crates.io Publishing

```bash
# Deploy with full automation
./scripts/cicd/local-cd.sh
```

**What local-cd.sh does**:


- CHANGELOG.md verification
- Version management (bump or manual)
- Git commit with standardized message
- Git tag creation (`v0.0.X`)
- Push to GitHub with tags
- Publish to crates.io automatically
- **No NPM publishing (manual only)**

### 3. Manual NPM Publishing

```bash
cd npm/terminal-jarvis
npm run sync-readme  # Sync README from root
npm run build        # Build TypeScript
npm publish          # Publish to NPM

# Tag the release
npm dist-tag add terminal-jarvis@X.X.X latest
npm dist-tag add terminal-jarvis@X.X.X stable  # If production-ready
```

### 4. Crates.io Publishing (Automated)

The `local-cd.sh` script automatically publishes to crates.io after:


- Validating cargo login status
- Running full test suite
- Creating git tags
- Pushing to GitHub

## Version Management

### Version Bump Strategy

Terminal Jarvis uses semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (v1.0.0, v2.0.0)
- **MINOR**: New features, backwards compatible (v0.1.0, v0.2.0)
- **PATCH**: Bug fixes (v0.0.1, v0.0.2)

### Files to Update

When bumping versions, update:

1. **Cargo.toml** - Rust crate version
2. **npm/terminal-jarvis/package.json** - NPM package version
3. **CHANGELOG.md** - Document changes
4. **README.md** - Update version badges (if needed)
5. **homebrew/Formula/terminal-jarvis.rb** - Homebrew Formula version (automated by local-cd.sh)

## Tools Manifest System

Terminal Jarvis uses a **single source of truth** for managing tool information.

### Manifest Location

Tool configurations are in `config/tools/*.toml`:

```
config/tools/
├── claude.toml
├── gemini.toml
├── qwen.toml
└── ... (10 tools total)
```

### Adding New Tools

1. **Add to manifest**: Create new TOML file in `config/tools/`
2. **Tool automatically discovered**: No code changes needed!
3. **Test locally**: Verify tool works with `terminal-jarvis list`

### Status Types

- **stable**: Production-ready, thoroughly tested
- **testing**: Feature-complete, seeking feedback
- **new**: Recently added, actively being integrated

## Distribution Tags Strategy

### Tag Types

- **`latest`**: Automatically assigned when publishing (default install)
- **`beta`**: Preview releases with newest features
- **`stable`**: Production-ready, thoroughly tested releases

### Installation Commands

Users can install through multiple channels:

#### NPM Installation

```bash
# Latest version (default)
npm install -g terminal-jarvis

# Beta releases (newest features)
npm install -g terminal-jarvis@beta

# Stable releases (production-ready)
npm install -g terminal-jarvis@stable

# Specific version
npm install -g terminal-jarvis@0.0.X
```

#### Cargo Installation

```bash
cargo install terminal-jarvis
```

#### Homebrew Installation

```bash
brew tap ba-calderonmorales/terminal-jarvis
brew install terminal-jarvis
```

## Pre-Release Checklist

Before running `local-cd.sh`:


- [ ] **Update CHANGELOG.md** with all changes
- [ ] **Run local-ci.sh** and ensure all tests pass
- [ ] **Verify version** consistency across files
- [ ] **Test NPM package** locally (`npm pack` and install)
- [ ] **Check git status** - working tree should be clean
- [ ] **Review documentation** - ensure all docs are up to date

## Troubleshooting

### Version Mismatch Errors

If `local-cd.sh` detects version mismatches:

1. Check `Cargo.toml` version
2. Check `npm/terminal-jarvis/package.json` version
3. Ensure both match
4. Re-run the script

### NPM Publishing Fails

```bash
# Check NPM login status
npm whoami

# Re-login if needed
npm login

# Verify package.json is valid
cd npm/terminal-jarvis
npm run build
npm pack --dry-run
```

### Crates.io Publishing Fails

```bash
# Check cargo login
cargo login --list

# Re-login if needed
cargo login

# Test publish without actually publishing
cargo publish --dry-run
```

### Homebrew Formula Issues

The `local-cd.sh` script automatically handles Homebrew Formula updates, but if issues occur:

```bash
# Manually test Formula locally
./scripts/test-homebrew-formula.sh

# Check archive generation
ls -lh terminal-jarvis-*.tar.gz

# Verify SHA256 checksums
shasum -a 256 terminal-jarvis-*.tar.gz
```

## Script Safety Features

### local-cd.sh Safety Mechanisms

- **CHANGELOG.md verification**: Ensures documentation before release
- **Version consistency checks**: Prevents mismatched versions
- **Dry-run mode**: Test without making changes (`--check-versions`)
- **Interactive confirmations**: Prompts before destructive operations
- **Git status validation**: Ensures clean working tree
- **Rollback instructions**: Provides recovery steps if something fails

### Emergency Rollback

If a release goes wrong:

```bash
# Revert the git tag
git tag -d v0.0.X
git push origin :refs/tags/v0.0.X

# Unpublish from NPM (within 72 hours)
npm unpublish terminal-jarvis@X.X.X

# Yank from crates.io (doesn't delete, just marks as yanked)
cargo yank --vers X.X.X terminal-jarvis
```

## Emergency Procedures

### Critical Bug in Production

1. **Identify the issue** and create a hotfix branch
2. **Fix the bug** with minimal changes
3. **Test thoroughly** with `local-ci.sh`
4. **Bump PATCH version** (e.g., 0.0.50 → 0.0.51)
5. **Update CHANGELOG.md** with fix details
6. **Run local-cd.sh** to deploy
7. **Publish to NPM** immediately
8. **Tag as latest and stable**

### Reverting a Bad Release

If a critical issue is discovered after release:

1. **Yank the bad version** from crates.io
2. **Deprecate NPM version** with warning
3. **Create hotfix** following emergency procedure above
4. **Communicate** to users via GitHub release notes

## Package Details

### Current Stats

- **Package Size**: ~1.4MB compressed / ~3.7MB unpacked
- **Node Requirement**: >=16.0.0
- **Dependencies**: Zero runtime dependencies (self-contained binary)
- **Registry**: https://www.npmjs.com/package/terminal-jarvis

### Architecture

- **Rust binary**: Pre-compiled for immediate functionality
- **NPM wrapper**: TypeScript integration layer
- **Zero deps**: No additional runtime requirements

## Maintenance Commands

### Check Package Health

```bash
# NPM package info
npm view terminal-jarvis

# Distribution tags
npm dist-tag ls terminal-jarvis

# Download stats
npm view terminal-jarvis --json
```

### Local Testing

```bash
# Test package locally
cd npm/terminal-jarvis
npm pack
cd /tmp && npm install /path/to/terminal-jarvis-X.X.X.tgz
npx terminal-jarvis --help
```

## Contact and Support

For maintainer-specific questions:


- **Email**: brandon.ceemoe@gmail.com
- **GitHub Issues**: Technical discussions
- **Discord**: Real-time coordination

## Next Steps

- [Testing Guide](testing.md) - Comprehensive testing strategies
- [Architecture Guide](architecture.md) - Technical internals
- [Contributing Guide](contributions.md) - Community guidelines
