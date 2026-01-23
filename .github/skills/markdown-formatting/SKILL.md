# Skill: Markdown Formatting Standards

Apply consistent markdown formatting across documentation.

## When to Use

- Writing new documentation
- Reviewing or editing existing docs
- Fixing formatting inconsistencies

## Headings

```markdown
# Page Title (H1 - only one per page)

## Major Section (H2)

### Subsection (H3)

#### Minor heading (H4 - use sparingly)
```

## Lists

### Unordered Lists

```markdown
- Item 1
- Item 2
- Item 3
```

### Nested Lists with Bold Headers

Use 4 spaces for sub-items:

```markdown
- **Bold header**

    - Sub-item indented with 4 spaces
    - Another sub-item

- **Another header**

    - Its sub-items
```

### Ordered Lists

```markdown
1. First step
2. Second step
3. Third step
```

### Definition Lists (MkDocs Material)

```markdown
Term
:   Definition of the term.
    Can span multiple lines.
```

## Code Blocks

### Inline Code

```markdown
Use `backticks` for inline code like `variable_name` or `function()`.
```

### Fenced Code Blocks

````markdown
```python
def example():
    return "Always specify language"
```
````

### Code with Title

````markdown
```python title="example.py"
def main():
    print("Hello")
```
````

## Tables

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
```

## Admonitions

```markdown
!!! note
    This is a note admonition.

!!! warning
    This is a warning.

!!! tip "Custom Title"
    Tips with custom titles.

??? info "Collapsible"
    This content is hidden by default.
```

## Links

### Internal Links

```markdown
[Link text](../relative/path.md)
[Section link](#section-heading)
[Another page](other-page.md#specific-section)
```

### External Links

```markdown
[LeetCode](https://leetcode.com/problems/example/)
```

## MkDocs Material Features

### Grid Cards

```markdown
<div class="grid cards" markdown>

-   :material-icon:{ .lg .middle } **Card Title**

    ---

    Card description.

    [Link](path.md)

</div>
```

### Icons

```markdown
:material-check: Checkmark
:material-close: X mark
:octicons-heart-16: Heart
```

## Rules

1. **No emojis** in commits, docs, or comments
2. **One H1** per page (the page title)
3. **Blank lines** around headings, code blocks, and lists
4. **4-space indentation** for nested content under list items
5. **Consistent formatting** within a page

## Checklist

- [ ] Single H1 at top of page
- [ ] Proper heading hierarchy (no skipping levels)
- [ ] Code blocks have language specified
- [ ] Lists properly indented
- [ ] Links are valid (relative for internal)
- [ ] No trailing whitespace
