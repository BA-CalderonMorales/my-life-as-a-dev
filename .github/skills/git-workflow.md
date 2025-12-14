# Skill: Git Workflow

Follow proper git workflow for this repository.

## When to Use

- Making any changes to the repository
- Creating commits
- Opening pull requests

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]
```

### Types

| Type | Use For |
|------|---------|
| `feat` | New features or content |
| `fix` | Bug fixes |
| `docs` | Documentation only changes |
| `chore` | Maintenance tasks |
| `refactor` | Code restructuring |
| `style` | Formatting changes |
| `test` | Test additions/changes |

### Examples

```bash
# Adding new documentation
git commit -m "docs: add sliding window algorithm pattern"

# Adding new feature
git commit -m "feat(cli): add deploy command"

# Fixing something
git commit -m "fix: correct broken link in algorithms index"

# Maintenance
git commit -m "chore: update dependencies"

# Refactoring
git commit -m "refactor: extract problems to sub-pages"
```

### Rules

- **No emojis** in commit messages
- Use imperative mood ("add" not "added")
- Keep subject line under 72 characters
- Reference issues when applicable: `fix: broken link (#123)`

## Branching

### Branch Naming

```
feature/description
bugfix/description
cleanup/description
hotfix/description
```

### Branch Targets

| Branch Type | Target |
|-------------|--------|
| Feature | `develop` |
| Bugfix | `develop` |
| Cleanup | `develop` |
| Pipeline | `develop` |
| Hotfix | `main` |

## Pull Requests

### PR Title

Use same format as commits:
```
feat: add new algorithm pattern
```

### PR Description

Include:
1. What changed
2. Why it changed
3. How to test

### CI Checklist

Include in PR body:
```markdown
## Checklist
- [ ] `make setup` succeeds
- [ ] `make build` succeeds
- [ ] `make serve` renders correctly
- [ ] No linting errors
```

## Quick Workflow

```bash
# 1. Create feature branch
git checkout -b feature/add-union-find-pattern

# 2. Make changes
# ... edit files ...

# 3. Stage and commit
git add .
git commit -m "feat: add union find algorithm pattern"

# 4. Push
git push -u origin feature/add-union-find-pattern

# 5. Open PR via GitHub
```

## Checklist

- [ ] Branch name follows convention
- [ ] Commit messages follow conventional commits
- [ ] No emojis in commits
- [ ] PR targets correct branch
- [ ] CI checklist included in PR
