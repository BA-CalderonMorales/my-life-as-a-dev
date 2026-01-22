---
title: Zensical - The Future of Material for MkDocs
description: Exploring Zensical, the modern static site generator from the creators of Material for MkDocs.
tags:
  - Documentation
  - Python
  - Setup
comments: true
---

# Zensical

[Zensical](https://zensical.org/) is a modern static site generator built by the creators of Material for MkDocs. It represents the next evolution of documentation tooling, offering a fresh approach while maintaining the design principles that made Material for MkDocs successful.

!!! success "Migration Status: Complete"
    This site now uses **Zensical as the primary build system**. Run `make serve` to start the development server. MkDocs is available as a legacy fallback via `make mkdocs-serve`.

## Why Zensical?

The Material for MkDocs team has been developing Zensical to address some limitations of the MkDocs ecosystem and to provide a more modern, performant foundation for documentation sites.

### Key Benefits

- **Built from the Ground Up**: Zensical is not just an extension or theme, but a complete static site generator designed with modern web practices in mind.

- **Familiar Design Language**: If you love the Material for MkDocs aesthetic, Zensical maintains that familiar look while introducing improvements.

- **TOML Configuration**: Uses TOML for configuration instead of YAML, providing cleaner syntax and better tooling support.

- **Modern Architecture**: Uses native compiled extensions for performance-critical paths, combined with Python for extensibility.

- **Blazing Fast Builds**: Full site builds complete in under 1 second (compared to several seconds with MkDocs).

## This Project's Setup

### Quick Start

```bash
# Run with Zensical (primary)
make serve        # Development server on port 8001

# Build
make build        # Zensical production build

# Legacy MkDocs (if needed)
make mkdocs-serve # Development server on port 8000
make mkdocs-build # MkDocs production build
```

### Configuration Files

| File | Purpose |
|------|---------|
| `zensical.toml` | Zensical configuration (TOML) |
| `mkdocs.yml` | MkDocs configuration (YAML, legacy) |

## Getting Started with Zensical

### Installation

```bash
pip install zensical
```

### Creating a New Project

```bash
zensical new my-docs
cd my-docs
```

### Building and Serving

```bash
# Serve locally for development
zensical serve

# Build for production
zensical build
```

## Configuration Example

Zensical uses a `zensical.toml` file for configuration:

```toml
[project]
site_name = "My Documentation"
site_description = "Documentation for my project"
site_author = "Your Name"

[project.theme]
# Use "classic" for traditional Material for MkDocs look
# variant = "classic"

# Navigation can be auto-generated from docs structure
# or explicitly defined
# nav = [
#   { "Get started" = "index.md" },
#   { "Guide" = "guide.md" },
# ]
```

## Comparison with MkDocs Material

| Feature | MkDocs Material | Zensical |
|---------|-----------------|----------|
| Config Format | YAML | TOML |
| Theme System | MkDocs Themes | Native Theming |
| Build Speed | Fast | Very Fast |
| Plugin System | MkDocs Plugins | Native Extensions |
| Migration | - | Straightforward |

## Migration Path

Migrating from MkDocs Material to Zensical is designed to be straightforward:

1. **Install Zensical**: Add `zensical` to your dependencies

2. **Convert Configuration**: Transform your `mkdocs.yml` to `zensical.toml`

3. **Adjust Templates**: Custom templates may need minor adjustments

4. **Test and Iterate**: Run `zensical serve` to verify the migration

### Example Migration

**Before (mkdocs.yml)**:

```yaml
site_name: My Documentation
site_description: Documentation for my project

theme:
  name: material
  features:
    - navigation.instant
    - content.code.copy
```

**After (zensical.toml)**:

```toml
[project]
site_name = "My Documentation"
site_description = "Documentation for my project"

[project.theme]
# Zensical includes many features by default
```

## This Project's Migration Status

This documentation site now runs in **dual-mode**, supporting both MkDocs Material and Zensical:

| Aspect | Status |
|--------|--------|
| `zensical.toml` configuration | Complete |
| Navigation structure | Fully migrated |
| Theme settings | Configured |
| Build working | Yes (< 1 second) |
| Dev server working | Yes |

### What's Working

- Full site builds with all pages
- Navigation structure matches MkDocs layout
- Dark/light mode toggle
- Code highlighting and copy buttons
- Search functionality

### Migration Notes

The migration was straightforward:

1. Created `zensical.toml` with equivalent settings from `mkdocs.yml`
2. Converted YAML navigation to TOML array-of-tables format
3. Updated `Makefile` with `serve` and `build` as primary Zensical commands
4. Updated GitHub Actions workflow to use Zensical for production builds
5. Updated doc-cli with simplified command names

## Resources

- [Zensical Documentation](https://zensical.org/docs/)

- [Zensical GitHub Repository](https://github.com/zensical/zensical)

- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)

## Completed

- [x] Full cutover to Zensical as primary build system
- [x] GitHub Pages deployment with Zensical
- [x] Simplified CLI commands (serve/build)
