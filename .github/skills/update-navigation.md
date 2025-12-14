# Skill: Update Navigation

Update the MkDocs navigation structure in mkdocs.yml.

## When to Use

- After adding new documentation pages
- Reorganizing existing content
- Fixing navigation issues
- Adding new sections

## Navigation File Location

All navigation is defined in `mkdocs.yml` under the `nav` key (around line 113).

## Navigation Structure

```yaml
nav:
  - Display Name: path/to/file.md
  
  - Section Name:
      - Subsection: path/to/index.md
      - Page: path/to/page.md
      
  - Nested Section:
      - Category:
          - Overview: path/index.md
          - Topic: path/topic.md
```

## Common Patterns

### Adding a Simple Page

```yaml
nav:
  - Existing Section:
      - Existing Page: existing/page.md
      - New Page: existing/new_page.md  # Add here
```

### Adding a New Section

```yaml
nav:
  - New Section:
      - Overview: new_section/index.md
      - Topic 1: new_section/topic1.md
      - Topic 2: new_section/topic2.md
```

### Adding Nested Content

```yaml
nav:
  - Parent:
      - Child Category:
          - Overview: parent/child/index.md
          - Grandchild: parent/child/grandchild.md
```

## Rules

1. **Paths are relative to `docs/`**: `learning/index.md` means `docs/learning/index.md`
2. **Order matters**: Items appear in nav in the order listed
3. **Index pages**: Use `index.md` for section landing pages
4. **Display names**: The text before `:` is what users see

## Indentation

- Use 2 spaces for YAML indentation (or 4 if that's the file's existing style)
- Be consistent with existing indentation in the file

## Verification

After editing:

```bash
# Check YAML syntax
python -c "import yaml; yaml.safe_load(open('mkdocs.yml'))"

# Full build test
make build
```

## Common Errors

**"Page not found in docs directory"**
- Check file path is correct and file exists
- Ensure path is relative to `docs/`

**"Duplicate page in nav"**
- Same file listed twice in nav
- Remove duplicate entry

**Broken internal links**
- Update links in content when moving pages

## Checklist

- [ ] Identified correct location in nav structure
- [ ] Used correct indentation
- [ ] Path matches actual file location
- [ ] Display name is clear and concise
- [ ] Verified with `make build`
