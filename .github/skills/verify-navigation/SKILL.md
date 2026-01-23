# Skill: Verify Navigation

Verify all documentation pages are properly linked in navigation before committing.

## When to Use

- After adding new documentation pages
- After refactoring or moving pages
- Before committing any documentation changes
- When build output shows "not included in nav" warnings

## Quick Check

```bash
source .venv/bin/activate
PYTHONPATH=$(pwd) mkdocs build 2>&1 | grep -E "(not included in|ERROR)"
```

If this returns nothing, all pages are properly linked.

## Step-by-Step Verification

### 1. Run Build and Capture Output

```bash
cd /workspaces/my-life-as-a-dev
source .venv/bin/activate
PYTHONPATH=$(pwd) mkdocs build 2>&1 | tee build.log
```

### 2. Check for Missing Nav Entries

Look for this message in the output:

```
INFO - The following pages exist in the docs directory, but are not included in the "nav" configuration:
  - path/to/missing/page.md
  - another/missing/page.md
```

**Exception**: `404.md` is expected to be missing from nav (it's a special error page).

### 3. Fix Missing Entries

For each missing page, add it to `mkdocs.yml` nav section.

**Algorithm problem pages** need nested structure:

```yaml
# Before (topic without problems)
- Topic Name: learning/algorithms/topic/index.md

# After (topic with problems)
- Topic Name:
    - Overview: learning/algorithms/topic/index.md
    - Problems:
        - Problem Name: learning/algorithms/topic/problems/problem_name.md
```

**Regular pages** just need a simple entry:

```yaml
- Page Name: path/to/page.md
```

### 4. Verify Fix

Re-run the build:

```bash
PYTHONPATH=$(pwd) mkdocs build 2>&1 | grep "not included in"
```

Should return empty (or only show `404.md`).

### 5. Runtime Verification (Optional)

For thorough testing, start the dev server:

```bash
./doc-cli startup
# or
PYTHONPATH=$(pwd) mkdocs serve
```

Check startup output for warnings. Navigate to the new pages in browser to confirm they render correctly.

## Common Issues

### "Page not found in docs directory"

The path in `mkdocs.yml` doesn't match an actual file.

```yaml
# Wrong - file doesn't exist at this path
- Page: wrong/path/page.md

# Right - matches actual file location
- Page: correct/path/page.md
```

### Git Log Warnings

```
WARNING - [git-revision-date-localized-plugin] 'path/file.md' has no git logs
```

This is normal for uncommitted files. It will resolve after the first commit.

### Duplicate Page in Nav

Same file listed multiple times. Search `mkdocs.yml` for the filename and remove duplicates.

## Automation Script

Save time with this one-liner:

```bash
# Check for nav issues (should only show 404.md or nothing)
source .venv/bin/activate && PYTHONPATH=$(pwd) mkdocs build 2>&1 | grep -A 50 "not included in" | head -55
```

## Checklist

- [ ] Build completes without errors
- [ ] No pages listed as "not included in nav" (except 404.md)
- [ ] No "Page not found in docs directory" errors
- [ ] Dev server starts without navigation warnings
- [ ] New pages are accessible via navigation menu
