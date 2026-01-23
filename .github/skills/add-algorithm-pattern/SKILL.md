# Skill: Add Algorithm Pattern

Add a new algorithm pattern section with proper structure.

## When to Use

- Adding a new algorithmic technique (e.g., Union Find, Segment Tree)
- Creating a new pattern category
- Expanding the algorithms learning section

## Steps

### 1. Create Directory Structure

```bash
mkdir -p docs/learning/algorithms/{pattern_name}/problems
```

### 2. Create the Index Page

Create `docs/learning/algorithms/{pattern_name}/index.md`:

```markdown
# Pattern Name

Brief description of what this pattern is and when it's useful.

## When to Use This Pattern

Use this pattern when:

- Condition 1
- Condition 2
- Condition 3

## Core Approach

### Key Concepts

- **Concept 1**: Explanation
- **Concept 2**: Explanation

### Template Pattern

```python
def pattern_template(input):
    """General template for this pattern."""
    # Template code
    pass
```

## Practice Problems

| Problem | Difficulty | Key Concept |
|---------|------------|-------------|
| [Problem 1](problems/problem_1.md) | Medium | Concept |

## Key Takeaways

1. First key insight
2. Second key insight
3. Third key insight

## Practice Tips

- Tip 1
- Tip 2

## Common Mistakes

- Mistake 1
- Mistake 2

## LeetCode Practice

- [Problem Name](https://leetcode.com/problems/slug/)
```

### 3. Add to Navigation

**CRITICAL**: Update `mkdocs.yml` nav section:

```yaml
- Algorithms:
    - Overview: learning/algorithms/index.md
    # ... existing patterns ...
    - New Pattern: learning/algorithms/new_pattern/index.md  # Add here
```

### 4. Add to Algorithms Overview

Update `docs/learning/algorithms/index.md` to include the new pattern in the pattern reference section.

### 5. Create Initial Problems (Optional)

Add at least one problem to demonstrate the pattern:

```bash
# Create problem file
touch docs/learning/algorithms/{pattern_name}/problems/example_problem.md
```

### 6. Verify

```bash
make build
make serve  # Check rendering
```

## Checklist

- [ ] Created `{pattern}/` directory with `problems/` subdirectory
- [ ] Created `index.md` with full template
- [ ] Added to `nav` in `mkdocs.yml`
- [ ] Updated algorithms overview page
- [ ] Created at least one example problem (optional but recommended)
- [ ] Verified build and rendering
