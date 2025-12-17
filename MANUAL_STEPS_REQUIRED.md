# Manual Steps Required to Complete Infographics Setup

## Critical: Assets Branch Must Be Pushed to Remote

The infographics feature has been implemented, but there's **one critical manual step** required before the infographics will work on the live documentation site.

### The Issue

The infographics are stored on a separate `assets` branch (as per the requirements). This branch has been created locally with all the infographic HTML files, but it needs to be pushed to the remote GitHub repository.

During implementation, the automated push failed due to authentication restrictions in the CI/CD environment:

```
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/BA-CalderonMorales/my-life-as-a-dev/'
```

### What You Need to Do

**Option 1: Use the Helper Script (Recommended)**

Run this script which will handle everything:

```bash
./scripts/push-assets-branch.sh
```

The script will:
- Switch to the assets branch
- Show you what's on it
- Attempt to push to origin
- Provide helpful error messages if it fails
- Return you to your original branch

**Option 2: Push Manually**

If you have GitHub authentication set up:

```bash
git push -u origin assets
```

**Option 3: Use GitHub CLI**

```bash
gh auth login
git push -u origin assets
```

### Verifying the Push Worked

After pushing, verify the infographics are accessible by opening these URLs in your browser:

1. **Fast & Slow Pointers**:
   ```
   https://raw.githubusercontent.com/BA-CalderonMorales/my-life-as-a-dev/assets/algorithms/infographics/fast_slow_pointers/cycle_detection.html
   ```

2. **Sliding Window**:
   ```
   https://raw.githubusercontent.com/BA-CalderonMorales/my-life-as-a-dev/assets/algorithms/infographics/sliding_window/max_subarray.html
   ```

3. **Two Pointers**:
   ```
   https://raw.githubusercontent.com/BA-CalderonMorales/my-life-as-a-dev/assets/algorithms/infographics/two_pointers/two_sum_sorted.html
   ```

If these URLs load and show interactive infographics, you're all set!

### What's on the Assets Branch

The assets branch contains:

```
algorithms/
├── README.md
└── infographics/
    ├── arrays/
    ├── backtracking/
    ├── binary_search_on_answer/
    ├── dynamic_programming/
    ├── fast_slow_pointers/
    │   └── cycle_detection.html       ← Interactive visualization
    ├── graph_traversal/
    ├── greedy/
    ├── hash_tables/
    ├── heap_priority_queue/
    ├── monotonic_stack/
    ├── sliding_window/
    │   └── max_subarray.html          ← Interactive visualization
    ├── space_complexity/
    ├── trie/
    └── two_pointers/
        └── two_sum_sorted.html        ← Interactive visualization
```

### How This Works

1. The main documentation branch has pages with iframes that reference:
   ```html
   <iframe src="https://raw.githubusercontent.com/BA-CalderonMorales/my-life-as-a-dev/assets/...">
   ```

2. The `assets` branch serves as a storage location for these files

3. GitHub's raw content feature allows us to serve these HTML files directly

4. The infographics are self-contained HTML files with inline CSS and JavaScript

5. No external dependencies or build steps required for the assets

### Additional Documentation

See `ASSETS_BRANCH_SETUP.md` for more details about:
- The assets branch structure
- How to add new assets
- How to update existing assets
- Troubleshooting tips

### Testing Locally

If you want to test the infographics before the assets branch is pushed:

1. Switch to assets branch: `git checkout assets`
2. Open the HTML files directly in your browser:
   ```bash
   open algorithms/infographics/fast_slow_pointers/cycle_detection.html
   ```
3. The infographics should be fully interactive locally

## Summary

**Before the infographics work on your live site, you MUST:**

1. Push the assets branch: `git push -u origin assets`
2. Verify URLs are accessible as shown above
3. Check the documentation site to see the embedded infographics

**Everything else is ready to go!** The documentation pages, navigation, and skill guides are all in place.
