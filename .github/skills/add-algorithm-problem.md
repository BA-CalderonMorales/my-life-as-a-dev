# Skill: Add Algorithm Problem

Add a new practice problem to an algorithm pattern section.

## When to Use

- Adding a new LeetCode problem to an algorithm pattern
- Creating practice exercises for a topic
- Expanding problem coverage for interview prep

## Steps

### 1. Create the Problem File

Create the file in the `problems/` subdirectory of the algorithm topic:

```
docs/learning/algorithms/{topic}/problems/{problem_name}.md
```

**Naming Convention**: Use snake_case, descriptive names:
- `two_sum_sorted.md`
- `longest_substring_no_repeat.md`
- `number_of_islands.md`

### 2. Use the Problem Template

```markdown
# Problem Title

**Difficulty**: Easy | Medium | Hard  
**LeetCode**: [#XXX](https://leetcode.com/problems/problem-slug/)

## Problem Statement

Clear description of the problem with constraints.

**Example**:
```
Input: ...
Output: ...
Explanation: ...
```

## Approach

Explain the strategy:
1. First insight
2. Key observation
3. Algorithm choice

## Solution

```python
def solution(input):
    """
    Brief description.
    
    Time Complexity: O(?)
    Space Complexity: O(?)
    """
    # Implementation
    pass

# Test
print(solution(test_input))  # Expected output
```

## Step-by-Step Walkthrough

```
Trace through example input showing state at each step.
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
```

### 3. Link from Parent Index Page

Add a row to the "Practice Problems" table in the parent `index.md`:

```markdown
## Practice Problems

| Problem | Difficulty | Key Concept |
|---------|------------|-------------|
| [New Problem](problems/new_problem.md) | Medium | Key insight |
```

### 4. Update Navigation in mkdocs.yml

**CRITICAL**: Problem pages MUST be added to `mkdocs.yml` nav or they will cause runtime navigation issues.

Find the algorithm topic in `mkdocs.yml` and expand it to include the problem:

**Before** (simple entry):
```yaml
          - Sliding Window: learning/algorithms/sliding_window/index.md
```

**After** (expanded with problems):
```yaml
          - Sliding Window:
              - Overview: learning/algorithms/sliding_window/index.md
              - Problems:
                  - Max Sum Subarray K: learning/algorithms/sliding_window/problems/max_sum_subarray_k.md
                  - New Problem: learning/algorithms/sliding_window/problems/new_problem.md
```

If the topic already has a `Problems:` section, just add your new problem to it.

### 5. Verify

```bash
make build  # Should complete without "not included in nav" warnings for your file
```

Check the output for:
```
INFO - The following pages exist in the docs directory, but are not included in the "nav" configuration:
```

If your new file appears in this list, you missed step 4.

## Checklist

- [ ] Created file in `{topic}/problems/` directory
- [ ] Used correct template with all sections
- [ ] Included "Personal Notes" section at end
- [ ] Added link in parent index.md table
- [ ] **Updated `mkdocs.yml` nav with problem entry**
- [ ] Verified build succeeds with no nav warnings for your file
