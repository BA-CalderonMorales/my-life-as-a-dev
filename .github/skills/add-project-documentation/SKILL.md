# Skill: Add Project Documentation

Add documentation for a new project to the Projects section.

## When to Use

- Documenting a new active project
- Adding an experimental project
- Creating project portfolio entries

## Steps

### 1. Determine Project Category

- **Active**: Production-ready or actively maintained projects
- **Experiments**: Learning projects, prototypes, or explorations

### 2. Create Directory Structure

```bash
# For active projects
mkdir -p docs/projects/active/{project-name}/{quick_start,details}

# For experiments
mkdir -p docs/projects/experiments/{project-name}/{quick_start,details}
```

### 3. Create Required Files

**Minimal structure:**
```
{project-name}/
    index.md           # Project overview
    quick_start/
        index.md       # Getting started guide
    details/
        index.md       # Technical details
```

**Full structure (for larger projects):**
```
{project-name}/
    index.md
    quick_start/
        installation.md
        configuration.md
        usage.md
    details/
        architecture.md
        testing.md
        roadmap.md
```

### 4. Project Overview Template

Create `docs/projects/{category}/{project-name}/index.md`:

```markdown
# Project Name

Brief tagline or description.

<div class="grid cards" markdown>

-   :material-rocket-launch:{ .lg .middle } **Quick Start**

    ---

    Get up and running in minutes.

    [Get Started](quick_start/index.md)

-   :material-file-document:{ .lg .middle } **Details**

    ---

    Architecture, testing, and technical deep-dives.

    [Learn More](details/index.md)

</div>

## Overview

What this project does and why it exists.

## Key Features

- Feature 1
- Feature 2
- Feature 3

## Links

- [GitHub Repository](https://github.com/...)
- [Live Demo](https://...)
```

### 5. Update Navigation

**CRITICAL**: Add to `mkdocs.yml`:

```yaml
- Projects:
    - Active:
        - Overview: projects/active/index.md
        - New Project:
            - Overview: projects/active/new-project/index.md
            - Quick Start: projects/active/new-project/quick_start/index.md
            - Details: projects/active/new-project/details/index.md
```

### 6. Update Category Index

Add project to `docs/projects/active/index.md` or `docs/projects/experiments/index.md`.

### 7. Verify

```bash
make build
make serve
```

## Checklist

- [ ] Created directory structure
- [ ] Created index.md with overview
- [ ] Created quick_start/index.md
- [ ] Created details/index.md
- [ ] Added all pages to `nav` in `mkdocs.yml`
- [ ] Updated category index page
- [ ] Verified build and navigation
