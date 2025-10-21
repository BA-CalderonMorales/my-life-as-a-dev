# Verify Documentation Quality

**Purpose**: Verify documentation meets quality standards before deployment, with focus on the critical "NO EMOJIS" rule.

## Quick Verification

Use the built-in verification script:

```bash
cd /home/user/my-life-as-a-dev
PYTHONPATH=$(pwd) python scripts/python/verify_page.py
```

This runs headless browser tests checking for:
- Page title and H1 headings render correctly
- No emoji characters in headings (CRITICAL)
- No raw markdown syntax visible
- Buttons and tabs render properly
- Exit code 1 on failures

## Manual Emoji Check

Scan all documentation files for emojis:

```bash
# Check for common emoji patterns in markdown files
grep -r "[\u{1F300}-\u{1F9FF}]" docs/ --include="*.md" || echo "No emojis found"

# Check for emoji shortcodes (like :smile:, :rocket:) that aren't Material icons
grep -rE ":[a-z_]+:" docs/ --include="*.md" | grep -v ":material-" | grep -v ":octicons-"
```

## Material Icon Verification

Ensure Material icons are used correctly:

```bash
# Find all Material icon references
grep -rh ":material-" docs/ --include="*.md" | grep -o ":material-[^:]*:" | sort -u

# Check for broken icon references (common mistakes)
# Valid: :material-icon-name:
# Invalid: :material-icon-name (missing closing colon)
```

## Build Verification

Always build before deploying:

```bash
# Setup environment
make setup

# Build static site
make build

# Serve locally for visual inspection
make serve
```

## Style Consistency Checks

### Typography Verification

Check that headings follow weight patterns:

```bash
# Scan for inline styles that might override theme
grep -r "style=" docs/ --include="*.md"

# Check for hard-coded font weights
grep -r "font-weight" docs/ --include="*.md"
```

### Grid Cards Pattern

Verify grid cards use proper syntax:

```bash
# Find all grid card blocks
grep -A 5 '<div class="grid cards"' docs/ --include="*.md"

# Check for missing markdown attribute
grep 'class="grid cards"' docs/ --include="*.md" | grep -v 'markdown'
```

## Navigation Validation

Verify all nav links point to existing files:

```bash
python -c "
import yaml
from pathlib import Path

nav_file = Path('docs/.nav.yml')
nav_data = yaml.safe_load(nav_file.read_text())

def check_links(data, prefix=''):
    if isinstance(data, dict):
        for key, value in data.items():
            check_links(value, prefix)
    elif isinstance(data, list):
        for item in data:
            check_links(item, prefix)
    elif isinstance(data, str) and data.endswith('.md'):
        path = Path('docs') / data
        if not path.exists():
            print(f'MISSING: {data}')

check_links(nav_data)
print('Navigation validation complete')
"
```

## Comprehensive Pre-Deployment Checklist

Before deploying or committing:

- [ ] Run `make setup` to ensure environment is current
- [ ] Run `make build` successfully
- [ ] Run `PYTHONPATH=$(pwd) python scripts/python/verify_page.py`
- [ ] Check for emojis: `grep -r "[\u{1F300}-\u{1F9FF}]" docs/`
- [ ] Verify Material icons used correctly
- [ ] Visual inspection via `make serve`
- [ ] Check navigation links exist
- [ ] Verify no style overrides break theme
- [ ] Ensure commit message follows Conventional Commits

## CI/CD Validation

The GitHub Actions pipeline runs:

```yaml
# .github/workflows/github_pages.yml
- make setup
- mike deploy $VERSION latest --update-aliases
- Upload to GitHub Pages
```

Super-Linter also runs on PRs (`.github/workflows/super-linter.yml`):
- Markdown linting
- Python linting
- YAML validation

## Common Issues

| Issue | Detection | Fix |
|-------|-----------|-----|
| Emojis in docs | verify_page.py fails | Replace with Material icons |
| Broken nav links | Manual script above | Fix path in .nav.yml |
| Raw markdown visible | verify_page.py fails | Fix markdown syntax |
| Style inconsistencies | Visual inspection | Follow custom.css patterns |
| Plugin not found | Build fails | Run `make setup` |

## Expected Outcome

Documentation that:
- Contains zero emojis (uses Material icons instead)
- Builds successfully without errors
- Renders correctly in browser
- Follows all navigation conventions
- Passes all automated quality checks
- Maintains emotional minimalism aesthetic
