# Agent Skills

This directory contains detailed skill guides for AI assistants and contributors.

## How to Use

1. Reference from [AGENTS.md](../../AGENTS.md) for the skill index
2. Each skill is a self-contained guide with steps and checklists
3. Skills cover common repository workflows

## Skills

### Documentation
- [add-documentation-page.md](add-documentation-page.md) - Add new pages to the site
- [add-algorithm-problem.md](add-algorithm-problem.md) - Add practice problems
- [add-algorithm-pattern.md](add-algorithm-pattern.md) - Create new algorithm sections
- [add-project-documentation.md](add-project-documentation.md) - Document projects
- [update-navigation.md](update-navigation.md) - Modify mkdocs.yml nav
- [verify-navigation.md](verify-navigation.md) - Check for missing nav entries
- [refactor-large-pages.md](refactor-large-pages.md) - Break up large pages
- [markdown-formatting.md](markdown-formatting.md) - Formatting standards

### Development
- [build-and-test.md](build-and-test.md) - Build and validate docs
- [doc-cli-usage.md](doc-cli-usage.md) - Use the Rust CLI
- [testing.md](testing.md) - Run Python and Rust tests
- [code-standards.md](code-standards.md) - Code style guidelines

### Workflow
- [git-workflow.md](git-workflow.md) - Commits, branches, PRs
- [encode-fix-intent.md](encode-fix-intent.md) - Replace noisy comments with clearly named fix wrappers
- [version-and-deploy.md](version-and-deploy.md) - Release new versions

### Security
- [ai-security.md](ai-security.md) - AI features security

## Adding New Skills

1. Create a new `.md` file in this directory
2. Use the existing skill structure:
   - Title with `# Skill: Name`
   - "When to Use" section
   - "Steps" section with numbered steps
   - "Checklist" at the end
3. Add to the index in [AGENTS.md](../../AGENTS.md)
