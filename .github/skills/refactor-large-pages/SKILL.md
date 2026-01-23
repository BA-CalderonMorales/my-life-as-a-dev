# Skill: Refactor Large Pages

Break down large documentation pages into digestible sub-pages.

## When to Use

- Page has multiple distinct topics or problems
- Page is difficult to scan or navigate
- Content would benefit from individual "Personal Notes" sections
- Page length exceeds comfortable reading (>500 lines)

## Signs a Page Needs Refactoring

- Multiple `## Problem X:` sections
- Long code examples that could stand alone
- Distinct topics that don't flow together
- Users need to reference specific sections frequently

## Refactoring Strategy

### 1. Identify Extractable Content

Look for:
- Numbered sections (Problem 1, Problem 2, etc.)
- Self-contained examples with walkthroughs
- Topics that could have their own "Personal Notes"

### 2. Create Sub-Directory Structure

```bash
# For algorithm topics
mkdir -p docs/learning/algorithms/{topic}/problems

# For other content
mkdir -p docs/{section}/{topic}/examples
mkdir -p docs/{section}/{topic}/guides
```

### 3. Extract Content to Sub-Pages

Move each distinct section to its own file:

**Before** (`topic/index.md`):
```markdown
# Topic

Overview...

## Problem 1: Name
Full problem content...

## Problem 2: Name
Full problem content...
```

**After** (`topic/index.md`):
```markdown
# Topic

Overview...

## Practice Problems

| Problem | Difficulty | Key Concept |
|---------|------------|-------------|
| [Problem 1](problems/problem_1.md) | Medium | Concept |
| [Problem 2](problems/problem_2.md) | Hard | Concept |
```

**New file** (`topic/problems/problem_1.md`):
```markdown
# Problem 1 Name

Full content...

## Personal Notes

*Your notes here.*
```

### 4. Update Parent Index

Replace extracted content with:
- Brief summary
- Table linking to sub-pages
- Key concepts overview

### 5. Consider Navigation

**Sub-pages that should be in nav:**
- Major section pages users browse to directly

**Sub-pages that should NOT be in nav:**
- Problem pages (linked from parent)
- Examples (linked from parent)
- Reference material (linked from parent)

This keeps nav clean while allowing deep content.

### 6. Verify Links

Check all internal links still work:

```bash
make build  # Will report broken links
```

## Template for Extracted Problem Page

```markdown
# Problem Title

**Difficulty**: Medium  
**LeetCode**: [#XXX](https://leetcode.com/problems/slug/)

## Problem Statement

Description...

## Approach

Strategy...

## Solution

```python
# Code
```

## Step-by-Step Walkthrough

```
Trace...
```

## Personal Notes

*Add your own notes, insights, and variations here.*
```

## Checklist

- [ ] Identified content to extract
- [ ] Created appropriate sub-directory
- [ ] Moved content to individual files
- [ ] Added "Personal Notes" section to each
- [ ] Updated parent index with links table
- [ ] Verified build succeeds
- [ ] Checked all internal links work
