---
title: Zensical - The Future of Material for MkDocs
description: Exploring Zensical, the modern static site generator from the creators of Material for MkDocs.
---

# Zensical

[Zensical](https://zensical.org/) is a modern static site generator built by the creators of Material for MkDocs. It represents the next evolution of documentation tooling, offering a fresh approach while maintaining the design principles that made Material for MkDocs successful.

## Why Zensical?

The Material for MkDocs team has been developing Zensical to address some limitations of the MkDocs ecosystem and to provide a more modern, performant foundation for documentation sites.

### Key Benefits

- **Built from the Ground Up**: Zensical is not just an extension or theme, but a complete static site generator designed with modern web practices in mind.

- **Familiar Design Language**: If you love the Material for MkDocs aesthetic, Zensical maintains that familiar look while introducing improvements.

- **TOML Configuration**: Uses TOML for configuration instead of YAML, providing cleaner syntax and better tooling support.

- **Modern Architecture**: Built with Rust components for performance-critical paths, combined with Python for extensibility.

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

## This Project's Approach

This documentation site currently uses MkDocs Material but includes Zensical as a dependency to:

- **Showcase the Technology**: Demonstrate what Zensical offers

- **Prepare for Migration**: Have the tooling ready for when a full migration makes sense

- **Contribute to the Ecosystem**: Help the community understand migration patterns

## Resources

- [Zensical Documentation](https://zensical.org/docs/)

- [Zensical GitHub Repository](https://github.com/zensical/zensical)

- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)

## Future Plans

As Zensical matures, this site may fully migrate to demonstrate a complete docs-as-code workflow using the new tooling. The goal is to provide a real-world example of the migration process and showcase the benefits of adopting Zensical.
