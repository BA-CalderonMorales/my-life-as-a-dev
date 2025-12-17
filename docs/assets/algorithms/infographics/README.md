# Algorithm Infographics

## Current Status

This directory is a placeholder for future infographic assets. Currently, infographics are embedded directly in the documentation pages.

## Migration Plan

### Why Migration is Needed

The current infographics are self-contained HTML files with inline CSS and JavaScript. While functional, they add significant size to the repository and build:

- Each infographic is 12-17KB of HTML/CSS/JS
- These files are not minified during the build process
- Keeping them in the docs folder increases build time and repository size

### Proposed Solution

Migrate infographics to a separate assets branch or external hosting:

1. **Assets Branch Approach** (Recommended)
   - Create a dedicated `assets` branch
   - Store infographics at: `algorithms/infographics/{pattern_name}/{infographic_name}.html`
   - Reference via raw.githubusercontent.com URLs in iframes
   - Benefits:
     - Keeps main branch clean and build slim
     - Version control for assets
     - Easy to update/replace without affecting documentation
     - No impact on build performance

2. **External CDN Approach** (Alternative)
   - Host infographics on GitHub Pages, Netlify, or similar
   - Embed via external URLs
   - Benefits:
     - Even faster loading (CDN edge servers)
     - Zero impact on repository size
     - Can enable caching strategies

### Implementation Notes

**Important**: When migrating to assets branch:

1. The build configuration must NOT attempt to serve or process these HTML files
2. MkDocs should NOT minify or transform the infographic HTML
3. The iframe `src` URLs in documentation pages must point to:
   - Assets branch: `https://raw.githubusercontent.com/BA-CalderonMorales/my-life-as-a-dev/assets/algorithms/infographics/...`
   - Or direct file path if keeping in docs (not recommended for production)

**Build Performance**: 
- Infographics are loaded lazily via iframes with `loading="lazy"` attribute
- They only load when users scroll to them
- This prevents them from impacting initial page load time

### Current Infographics

The following infographics exist and need migration:

1. **Fast & Slow Pointers** - `cycle_detection.html` (16.7KB)
   - Interactive cycle detection visualization
   - Floyd's Tortoise and Hare algorithm

2. **Sliding Window** - `max_subarray.html` (12.8KB)
   - Maximum sum subarray demonstration
   - Shows window sliding and sum updates

3. **Two Pointers** - `two_sum_sorted.html` (15.4KB)
   - Two sum in sorted array
   - Pointer convergence visualization

**Total Size**: ~45KB for 3 infographics

### Technical Details

Each infographic is:
- Self-contained HTML with inline styles and scripts
- Uses vanilla JavaScript (no dependencies)
- Includes animation controls (play, pause, reset, speed)
- Responsive design with consistent styling
- Animation speed default: 1500ms (not too fast)

### How to Migrate

See `.github/skills/add-algorithm-infographic.md` for the complete process.

Quick steps:
1. Create/checkout assets branch
2. Copy infographic HTML files to assets branch
3. Update iframe URLs in documentation to point to assets branch
4. Test that iframes load correctly
5. Remove HTML files from docs folder
6. Commit and push both branches

### Open Questions

- Should we use assets branch or external hosting?
- What's the preferred caching strategy?
- Should infographics be versioned alongside documentation releases?
- Need to ensure GitHub Pages or raw.githubusercontent.com allows iframe embedding

## For Now

Until migration is complete, infographics are referenced via relative paths in the documentation. This works for local development but may need adjustment for production deployment.
