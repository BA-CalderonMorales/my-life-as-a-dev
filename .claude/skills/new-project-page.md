# Create New Project Documentation Page

**Purpose**: Create a new project documentation page following the established template and style patterns.

## Template Structure

All project documentation follows this 3-tier structure:

```
docs/projects/{category}/{project-slug}/
├── index.md              # Overview page
├── quick_start/
│   └── index.md         # Getting started guide
└── details/
    └── index.md         # Deep dive documentation
```

**Categories**:
- `active/` - Production-ready, actively maintained projects
- `experiments/` - R&D, testing, benchmarks for AI-assisted development

## Standard Page Template

### index.md (Overview)

```markdown
# Project Name

**One-line tagline in bold**

Brief description explaining what the project does and why it exists.

!!! tip "Quick Start"
    ```bash
    # Installation or quick trial command
    ```

## Overview

Detailed explanation of the problem space and how this project addresses it.

## Why [Project Name]?

**The Problem**:

- Pain point 1
- Pain point 2
- Pain point 3

**The Solution**:

- Solution aspect 1
- Solution aspect 2
- Solution aspect 3

## Key Features

- :material-icon-name: Feature description
- :material-icon-name: Feature description
- :material-icon-name: Feature description

## Quick Links

<div class="grid cards" markdown>

-   :material-github:{ .lg .middle } **GitHub Repository**

    ---

    Source code, issues, and discussions

    [:octicons-arrow-right-24: View on GitHub](https://github.com/USERNAME/repo)

-   :material-rocket:{ .lg .middle } **Live Demo**

    ---

    See it in action

    [:octicons-arrow-right-24: Try Demo](https://demo-url)

</div>

## Installation

=== "NPM"

    ```bash
    npm install project-name
    ```

=== "Cargo"

    ```bash
    cargo install project-name
    ```

## Documentation

<div class="grid cards" markdown>

-   :material-rocket-launch:{ .lg .middle } **Quick Start**

    ---

    Get up and running in minutes

    [:octicons-arrow-right-24: Quick Start](quick_start/index.md)

-   :material-book-open-variant:{ .lg .middle } **Details**

    ---

    Architecture, testing, and advanced topics

    [:octicons-arrow-right-24: Details](details/index.md)

</div>

## Community & Support

Information about how to get help or contribute.

## License

License information and credits.
```

### quick_start/index.md

```markdown
# Quick Start

Get started with [Project Name] in minutes.

## Prerequisites

List required tools, versions, dependencies.

## Installation

Step-by-step installation instructions.

## Configuration

How to configure the project.

## Basic Usage

Simple examples showing core functionality.

## Next Steps

### details/index.md

```markdown
# Details

    :fontawesome-brands-github:{ .lg .middle } **GitHub Repository**

## Architecture

System design, component interactions, data flow.

## Testing


## Contributing

How to contribute to the project.

## Roadmap

Future plans and upcoming features.

## Limitations

Known constraints and edge cases.
```

## Style Guidelines

### Typography
- **H1**: Ultra-light (weight 200), 2.5rem, tight letter spacing
- **H2**: Light (weight 300), 1.75rem, 3rem top margin
- **H3**: Normal (weight 400), 1.35rem, 2rem top margin
- Body text: Light (weight 300), line-height 1.85

### Material Design Patterns
- **Grid Cards**: Use `<div class="grid cards">` for navigation sections
- **Admonitions**: Use `!!! info`, `!!! success`, `!!! tip` for callouts
- **Tabs**: Use `=== "Tab Name"` for grouped content
- **Icons**: Use `:material-icon-name:` (NEVER use emojis)
- **Buttons**: Use `.md-button` and `.md-button--primary` classes

### Critical Rules
- **NO EMOJIS** - Use Material icons instead
- Maintain emotional minimalism aesthetic
- Use grid cards for navigation elements
- Include Quick Links section with GitHub/demo links
- Follow 3-tier structure (Overview/Quick Start/Details)

## Navigation Setup

After creating pages, add to `docs/.nav.yml`:

```yaml
- Projects:
  - Active Projects:  # or Experiments
    - Project Name:
      - Overview: projects/active/project-slug/index.md
      - Quick Start: projects/active/project-slug/quick_start/index.md
      - Details: projects/active/project-slug/details/index.md
```

## Workflow Steps

1. Choose category (active or experiments)
2. Create directory structure
3. Write index.md using template
4. Create quick_start/index.md
5. Create details/index.md
6. Update docs/.nav.yml
7. Test locally: `make serve`
8. Verify no emojis: `PYTHONPATH=$(pwd) python scripts/python/verify_page.py`
9. Commit with conventional commit message: `feat: add [project] documentation`

## Expected Outcome

A complete, professionally-formatted project documentation page that:
- Follows the emotional minimalism design aesthetic
- Uses Material Design patterns consistently
- Contains no emojis (uses Material icons instead)
- Provides clear navigation and quick access to key resources
- Maintains the 3-tier information architecture
