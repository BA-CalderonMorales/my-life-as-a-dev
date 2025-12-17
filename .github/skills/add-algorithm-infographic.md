# Skill: Add Algorithm Infographic

Add a new interactive infographic to visualize an algorithm pattern.

## When to Use

- Adding visual explanations for algorithm patterns
- Creating interactive demonstrations of how algorithms work
- Enhancing learning materials with animated content

## Prerequisites

- Familiarity with HTML, CSS, and JavaScript
- Understanding of the algorithm pattern being visualized
- Access to the assets branch

## Steps

### 1. Create the Infographic HTML

Switch to the assets branch and create the infographic file:

```bash
git checkout assets
```

Create the HTML file in the appropriate directory:

```
algorithms/infographics/{pattern_name}/{infographic_name}.html
```

**Guidelines for Creating Infographics:**

- Use self-contained HTML files (no external dependencies except CDN libraries)
- Implement consistent styling with existing infographics
- Include animation speed controls (not too fast - default around 1500ms)
- Add play, pause, and reset controls
- Use clear color coding with a legend
- Include explanatory text about time and space complexity
- Make animations smooth and easy to follow
- Ensure responsive design for different screen sizes

**Recommended Tools (Free & Open Source):**

- Plain HTML/CSS/JavaScript for simple animations
- D3.js for data visualizations
- Canvas API for custom animations
- SVG for scalable graphics
- CSS animations and transitions

**Color Scheme Consistency:**

- Use the existing color palette from other infographics
- Primary blue: `#4299e1`
- Success green: `#48bb78`
- Warning orange: `#ed8936`
- Purple accent: `#9f7aea`
- Background gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

### 2. Test the Infographic Locally

Open the HTML file in a browser and verify:

- [ ] Animations work smoothly
- [ ] Controls (play, pause, reset) function correctly
- [ ] Speed control adjusts animation appropriately
- [ ] Visual elements are clear and easy to understand
- [ ] Text is readable and explanatory
- [ ] Responsive on different screen sizes

### 3. Commit to Assets Branch

```bash
git add algorithms/infographics/{pattern_name}/
git commit -m "feat: add {infographic_name} infographic for {pattern_name}"
git push origin assets
```

### 4. Create Infographic Index Page

Switch back to your working branch:

```bash
git checkout main  # or your feature branch
```

If it doesn't exist, create the infographics directory:

```bash
mkdir -p docs/learning/algorithms/{pattern_name}/infographics
```

Create or update `docs/learning/algorithms/{pattern_name}/infographics/index.md`:

```markdown
# Pattern Name - Infographics

Interactive visualizations to help you understand how the {Pattern Name} works under the hood.

## Available Infographics

### Infographic Title

Brief description of what this infographic demonstrates.

<div class="infographic-container" style="margin: 20px 0; padding: 20px; background: #f7fafc; border-radius: 8px; border: 2px solid #e2e8f0;">
  <h4 style="margin-top: 0;">Interactive Demo: Title</h4>
  <p style="margin-bottom: 15px;">Description of what to watch for.</p>
  <iframe 
    src="https://raw.githubusercontent.com/BA-CalderonMorales/my-life-as-a-dev/assets/algorithms/infographics/{pattern_name}/{infographic_name}.html"
    style="width: 100%; height: 700px; border: none; border-radius: 8px;"
    title="Infographic Title"
    loading="lazy"
  ></iframe>
  <p style="margin-top: 10px; font-size: 0.9em; color: #718096;">
    <a href="https://raw.githubusercontent.com/BA-CalderonMorales/my-life-as-a-dev/assets/algorithms/infographics/{pattern_name}/{infographic_name}.html" target="_blank" style="color: #4299e1; text-decoration: none;">Open in new tab</a>
  </p>
</div>

## Key Concepts Visualized

- Concept 1
- Concept 2
- Concept 3

## Learning Tips

1. Tip 1
2. Tip 2
3. Tip 3

## Related Problems

- [Problem 1](../problems/problem_1.md)
```

### 5. Link from Algorithm Pattern Index

Update `docs/learning/algorithms/{pattern_name}/index.md` to add a link near the top:

```markdown
## Visual Learning

Want to see this pattern in action? Check out our [interactive infographics](infographics/index.md) that visualize how {pattern} works step-by-step.
```

### 6. Update Navigation in mkdocs.yml

Add the infographics entry to the pattern's navigation section:

```yaml
          - Pattern Name:
              - Overview: learning/algorithms/pattern_name/index.md
              - Infographics: learning/algorithms/pattern_name/infographics/index.md  # Add this
              - Problems:
                  - Problem 1: learning/algorithms/pattern_name/problems/problem_1.md
```

### 7. Build and Test

```bash
make build
```

Check for any warnings about missing navigation entries.

```bash
make serve
```

Navigate to the infographics page and verify:
- [ ] Page loads correctly
- [ ] Iframe displays the infographic
- [ ] Infographic is interactive
- [ ] Link to open in new tab works

### 8. Commit Changes

```bash
git add docs/learning/algorithms/{pattern_name}/
git add mkdocs.yml
git commit -m "docs: add infographics section for {pattern_name}"
```

## Checklist

- [ ] Created HTML infographic file in assets branch
- [ ] Infographic follows design guidelines (colors, controls, speed)
- [ ] Tested infographic locally in browser
- [ ] Committed and pushed to assets branch
- [ ] Created/updated infographics index page in docs
- [ ] Added visual learning link to pattern index page
- [ ] Updated mkdocs.yml navigation
- [ ] Built site successfully without warnings
- [ ] Tested infographic in live site preview
- [ ] Committed documentation changes

## Common Issues

### Iframe Not Loading

If the iframe doesn't display:
- Verify the assets branch exists on the remote repository
- Check that the file path in the iframe src is correct
- Ensure the raw.githubusercontent.com URL is accessible
- Try opening the direct link in a new tab to verify it loads

### Animation Too Fast/Slow

Adjust the default `animationSpeed` value in the JavaScript:
- Slower: increase from 1500ms to 2000-3000ms
- Faster: decrease to 1000-1200ms

### Styling Inconsistencies

Use the existing infographics as templates:
- `algorithms/infographics/fast_slow_pointers/cycle_detection.html`
- `algorithms/infographics/sliding_window/max_subarray.html`
- `algorithms/infographics/two_pointers/two_sum_sorted.html`

## Tips

- Keep animations smooth and not jarring
- Use clear labels and legends
- Include explanatory text about what's happening
- Make controls easily accessible
- Test on both desktop and mobile screen sizes
- Consider accessibility (color contrast, readable fonts)
