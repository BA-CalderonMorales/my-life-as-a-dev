#!/bin/bash

# Script to push the assets branch to remote repository
# This is needed for infographics to work on the live site

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

echo "=========================================="
echo "Assets Branch Push Helper"
echo "=========================================="
echo ""

# Check if assets branch exists locally
if ! git show-ref --verify --quiet refs/heads/assets; then
    echo "ERROR: Assets branch does not exist locally."
    echo "Please create it first following the instructions in ASSETS_BRANCH_SETUP.md"
    exit 1
fi

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Show what's on the assets branch
echo "Checking assets branch content..."
git checkout assets --quiet
echo "Files on assets branch:"
find algorithms -type f 2>/dev/null | head -10 || echo "No algorithm assets found"
echo ""

# Get commit info
ASSETS_COMMIT=$(git rev-parse --short HEAD)
ASSETS_COMMIT_MSG=$(git log -1 --pretty=format:"%s")
echo "Latest commit on assets branch:"
echo "  $ASSETS_COMMIT - $ASSETS_COMMIT_MSG"
echo ""

# Check remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
    echo "ERROR: No remote 'origin' configured"
    exit 1
fi
echo "Remote: $REMOTE_URL"
echo ""

# Attempt to push
echo "Attempting to push assets branch to origin..."
echo ""

if git push -u origin assets; then
    echo ""
    echo "=========================================="
    echo "SUCCESS: Assets branch pushed to remote!"
    echo "=========================================="
    echo ""
    echo "The infographics should now be accessible at:"
    echo "https://raw.githubusercontent.com/BA-CalderonMorales/my-life-as-a-dev/assets/algorithms/infographics/..."
    echo ""
    echo "Test URLs:"
    echo "  - Fast & Slow Pointers: https://raw.githubusercontent.com/BA-CalderonMorales/my-life-as-a-dev/assets/algorithms/infographics/fast_slow_pointers/cycle_detection.html"
    echo "  - Sliding Window: https://raw.githubusercontent.com/BA-CalderonMorales/my-life-as-a-dev/assets/algorithms/infographics/sliding_window/max_subarray.html"
    echo "  - Two Pointers: https://raw.githubusercontent.com/BA-CalderonMorales/my-life-as-a-dev/assets/algorithms/infographics/two_pointers/two_sum_sorted.html"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "PUSH FAILED"
    echo "=========================================="
    echo ""
    echo "Common causes:"
    echo "  1. Authentication required - try: gh auth login"
    echo "  2. No push access to repository"
    echo "  3. Remote assets branch has conflicts"
    echo ""
    echo "Try these solutions:"
    echo ""
    echo "1. Use GitHub CLI:"
    echo "   gh auth login"
    echo "   git push -u origin assets"
    echo ""
    echo "2. Use SSH instead of HTTPS:"
    echo "   git remote set-url origin git@github.com:BA-CalderonMorales/my-life-as-a-dev.git"
    echo "   git push -u origin assets"
    echo ""
    echo "3. Force push (use with caution):"
    echo "   git push -f origin assets"
    echo ""
    
    # Return to original branch before exiting
    git checkout "$CURRENT_BRANCH" --quiet
    exit 1
fi

# Return to original branch
echo "Returning to branch: $CURRENT_BRANCH"
git checkout "$CURRENT_BRANCH" --quiet

echo ""
echo "Done!"
