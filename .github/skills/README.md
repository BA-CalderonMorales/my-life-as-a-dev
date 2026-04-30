# Agent Skills

This directory contains detailed skill guides for AI assistants and contributors.

## Structure

Each skill is organized as a folder with a `SKILL.md` file:

```
.github/skills/
  {skill-name}/
    SKILL.md
```

## How to Use

1. Reference from [AGENTS.md](../../AGENTS.md) for the skill index
2. Each skill is a self-contained guide with steps and checklists
3. Skills cover common repository workflows

## Skills Index

### Documentation
| Skill | Description |
|-------|-------------|
| [add-documentation-page](add-documentation-page/SKILL.md) | Add new pages to the site |
| [add-algorithm-problem](add-algorithm-problem/SKILL.md) | Add practice problems |
| [add-algorithm-pattern](add-algorithm-pattern/SKILL.md) | Create new algorithm sections |
| [add-project-documentation](add-project-documentation/SKILL.md) | Document projects |
| [update-navigation](update-navigation/SKILL.md) | Modify mkdocs.yml nav |
| [verify-navigation](verify-navigation/SKILL.md) | Check for missing nav entries |
| [refactor-large-pages](refactor-large-pages/SKILL.md) | Break up large pages |
| [markdown-formatting](markdown-formatting/SKILL.md) | Formatting standards |

### Development
| Skill | Description |
|-------|-------------|
| [build-and-test](build-and-test/SKILL.md) | Build and validate docs |
| [doc-cli-usage](doc-cli-usage/SKILL.md) | Use the Rust CLI |
| [testing](testing/SKILL.md) | Run Python and Rust tests |
| [code-standards](code-standards/SKILL.md) | Code style guidelines |
| [hot-reload-troubleshooting](hot-reload-troubleshooting/SKILL.md) | Fix dev server issues |

### Testing & Debugging
| Skill | Description |
|-------|-------------|
| [browser-automation](browser-automation/SKILL.md) | Browser automation with Playwright through uv |
| [agent-browser](agent-browser/SKILL.md) | Deprecated; use browser-automation unless explicitly requested |
| [fix-console-errors](fix-console-errors/SKILL.md) | Debug browser console errors |

### Workflow
| Skill | Description |
|-------|-------------|
| [git-workflow](git-workflow/SKILL.md) | Commits, branches, PRs |
| [encode-fix-intent](encode-fix-intent/SKILL.md) | Replace noisy comments with fix wrappers |
| [version-and-deploy](version-and-deploy/SKILL.md) | Release new versions |

### Security
| Skill | Description |
|-------|-------------|
| [ai-security](ai-security/SKILL.md) | AI features security |

### Cloud Services
| Skill | Description |
|-------|-------------|
| [update-agent-flows](update-agent-flows/SKILL.md) | Add/modify ADK agents |
| [retrieve-cloud-source](retrieve-cloud-source/SKILL.md) | Fetch cloud resources |

## Adding New Skills

1. Create a new folder: `.github/skills/{skill-name}/`
2. Add `SKILL.md` inside with this structure:
   - Title with `# Skill: Name`
   - "When to Use" section
   - "Steps" section with numbered steps
   - "Checklist" at the end
3. Add to the index in this README
4. Add to the Skills Index in [AGENTS.md](../../AGENTS.md)
