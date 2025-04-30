#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}MkDocs Version Bumper${NC}"
echo "=============================="

# Get the latest tag from Git or use 0.0.0 if none exists
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "0.0.0")
LATEST_TAG=${LATEST_TAG#v} # Remove 'v' prefix if present

# Split the version into components
IFS='.' read -r MAJOR MINOR PATCH <<< "$LATEST_TAG"

echo -e "${YELLOW}Current version:${NC} $LATEST_TAG"
echo -e "What kind of version bump do you want to make?"
echo "1) Major (x.0.0)"
echo "2) Minor (0.x.0)"
echo "3) Patch (0.0.x)"
read -p "Enter choice [1-3]: " BUMP_TYPE

# Calculate new version based on bump type
case $BUMP_TYPE in
    1)
        NEW_MAJOR=$((MAJOR + 1))
        NEW_VERSION="${NEW_MAJOR}.0.0"
        ;;
    2)
        NEW_MINOR=$((MINOR + 1))
        NEW_VERSION="${MAJOR}.${NEW_MINOR}.0"
        ;;
    3)
        NEW_PATCH=$((PATCH + 1))
        NEW_VERSION="${MAJOR}.${MINOR}.${NEW_PATCH}"
        ;;
    *)
        echo "Invalid option. Exiting."
        exit 1
        ;;
esac

echo -e "${YELLOW}New version will be:${NC} $NEW_VERSION"
read -p "Proceed with this version? (y/n): " CONFIRM

if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
    echo "Version bump canceled."
    exit 0
fi

# Create new Git tag
echo "Creating new Git tag v$NEW_VERSION..."
git tag -a "v$NEW_VERSION" -m "Version $NEW_VERSION"

# Push the tag to remote
echo "Pushing tag to remote..."
git push origin "v$NEW_VERSION"

echo -e "${GREEN}Version bump to $NEW_VERSION complete!${NC}"
echo -e "${YELLOW}Note:${NC} The documentation will be updated with this version on the next GitHub workflow run"  