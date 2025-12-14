# Skill: Add Documentation Page

Add a new documentation page to this MkDocs site with proper navigation integration.

## When to Use

- Adding a new topic page to any section
- Creating a new algorithm pattern page
- Adding a new project documentation page
- Expanding any existing section with new content

## Steps

### 1. Create the Page File

Create the markdown file in the appropriate location:

```
docs/{section}/{subsection}/index.md      # For section index pages
docs/{section}/{subsection}/{topic}.md    # For topic pages
```

### 2. Update Navigation in mkdocs.yml

**CRITICAL**: Every new page must be added to the `nav` section in `mkdocs.yml`.

Open `mkdocs.yml` and add the page to the appropriate location in the `nav` tree:

```yaml
nav:
  - Section Name:
      - Subsection: path/to/new/page.md   # Add your page here
```

### 3. Common Navigation Patterns

**Adding to Learning/Algorithms:**
```yaml
- Algorithms:
    - Overview: learning/algorithms/index.md
    - New Pattern: learning/algorithms/new_pattern/index.md  # Add here
```

**Adding to Projects:**
```yaml
- Projects:
    - Active:
        - New Project:
            - Overview: projects/active/new-project/index.md
```

### 4. Verify the Build

Always verify after adding:

```bash
make build
# or
PYTHONPATH=$(pwd) mkdocs build --strict
```

## Page Template

```markdown
# Page Title

Brief description of what this page covers.

## Section 1

Content here.

## Section 2

More content.

## Related

- [Link to related page](../related/index.md)
```

## Checklist

- [ ] Created markdown file in correct location
- [ ] Added entry to `nav` in `mkdocs.yml`
- [ ] Used correct relative path in nav
- [ ] Verified build succeeds with `make build`
- [ ] Checked page renders correctly with `make serve`
