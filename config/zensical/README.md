# Zensical Configuration Files

This folder contains modular configuration files that are merged into the root `zensical.toml`.

## Structure

| File | Purpose |
|------|---------|
| `01-site.toml` | Site identity, metadata, and repository info |
| `02-assets.toml` | Custom CSS and JavaScript files |
| `03-navigation.toml` | Site navigation structure |
| `04-theme.toml` | Theme settings, colors, fonts, and features |
| `05-markdown.toml` | Markdown extensions configuration |
| `06-plugins.toml` | Plugin configuration |
| `07-development.toml` | Development server and watch paths |

## Usage

After editing any config file, regenerate the root `zensical.toml`:

```bash
# Using the merge script
uv run python scripts/python/merge_zensical_config.py

# Or via make
make config
```

## File Ordering

Files are processed in alphabetical order. The numeric prefix ensures:
1. Core settings load first
2. Navigation loads before theme (for potential references)
3. Plugins load last (may depend on other settings)

## Adding New Domains

1. Create a new file with appropriate numeric prefix
2. Use standard TOML syntax
3. Run the merge script to regenerate `zensical.toml`

## Notes

- The root `zensical.toml` is auto-generated - do not edit directly
- Comments in domain files are preserved in the merged output
- Each file should be a valid TOML fragment under `[project]`
