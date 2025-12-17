# Assets Branch Setup Guide

This document explains the assets branch structure and how to deploy it.

## Overview

The `assets` branch is a separate branch dedicated to storing static assets like infographics. This approach allows us to:

- Keep the main branch clean and focused on documentation
- Version control assets independently
- Easily update/replace assets without affecting documentation
- Serve assets via raw.githubusercontent.com directly in iframes

## Current Status

The assets branch has been created locally with the following structure:

```
assets branch
└── algorithms/
    ├── README.md
    └── infographics/
        ├── fast_slow_pointers/
        │   └── cycle_detection.html
        ├── sliding_window/
        │   └── max_subarray.html
        ├── two_pointers/
        │   └── two_sum_sorted.html
        └── [other patterns]/
```

## Pushing the Assets Branch to Remote

### Important: This Must Be Done Before Infographics Work on Live Site

The infographics will not display on the live documentation site until the assets branch is pushed to GitHub. The documentation pages use iframes that fetch content from:

```
https://raw.githubusercontent.com/BA-CalderonMorales/my-life-as-a-dev/assets/algorithms/infographics/...
```

### Steps to Push Assets Branch

1. **Ensure you have push access** to the repository

2. **Push the assets branch**:
   ```bash
   git push -u origin assets
   ```

3. **Verify the push succeeded**:
   ```bash
   git branch -r | grep assets
   ```
   
   You should see: `origin/assets`

4. **Test that assets are accessible**:
   
   Open this URL in your browser (replace the path as needed):
   ```
   https://raw.githubusercontent.com/BA-CalderonMorales/my-life-as-a-dev/assets/algorithms/infographics/fast_slow_pointers/cycle_detection.html
   ```
   
   If you see the infographic HTML, it's working!

### Troubleshooting

**If push fails due to authentication:**

- Ensure you're authenticated with GitHub (check `git remote -v`)
- Try using SSH instead of HTTPS:
  ```bash
  git remote set-url origin git@github.com:BA-CalderonMorales/my-life-as-a-dev.git
  git push -u origin assets
  ```
- Or use GitHub CLI:
  ```bash
  gh auth login
  git push -u origin assets
  ```

**If assets branch already exists on remote:**

Check if there's an existing assets branch:
```bash
git fetch origin
git branch -r | grep assets
```

If it exists, you may need to force push or merge:
```bash
# Option 1: Force push (use with caution)
git push -f origin assets

# Option 2: Merge with remote
git checkout assets
git pull origin assets
git push origin assets
```

## Future Assets

As you add more assets to other domains (not just algorithms), use the domain-based structure:

```
assets branch
├── algorithms/
│   └── infographics/
├── projects/
│   └── images/
├── design/
│   └── mockups/
└── [other domains]/
```

This keeps the assets branch organized and scalable.

## Updating Assets

To update an existing asset:

1. Checkout the assets branch:
   ```bash
   git checkout assets
   ```

2. Make your changes to the asset file

3. Commit and push:
   ```bash
   git add algorithms/infographics/...
   git commit -m "feat: update [asset name]"
   git push origin assets
   ```

4. The changes will be immediately available via the raw.githubusercontent.com URL

5. No changes needed to the main documentation branch - the iframe src URLs remain the same

## Adding New Assets

Follow the process in `.github/skills/add-algorithm-infographic.md` skill guide.

## Notes

- The assets branch is independent from the main branch
- Changes to assets don't trigger documentation rebuilds (which is good for performance)
- Assets can be cached by CDNs and browsers
- Always test assets locally before pushing
- Keep asset file sizes reasonable for web delivery
