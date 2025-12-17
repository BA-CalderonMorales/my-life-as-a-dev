# Two Pointers - Infographics

Interactive visualizations to help you understand how the Two Pointers pattern works under the hood.

## Available Infographics

### Two Sum in Sorted Array

An interactive visualization showing how the two pointers technique finds two numbers that sum to a target value in a sorted array.

<div class="infographic-container" style="margin: 20px 0; padding: 20px; background: #f7fafc; border-radius: 8px; border: 2px solid #e2e8f0;">
  <h4 style="margin-top: 0;">Interactive Demo: Two Sum in Sorted Array</h4>
  <p style="margin-bottom: 15px;">Watch how pointers start at opposite ends and move toward each other based on comparing the current sum to the target.</p>
  <iframe 
    src="two_sum_sorted.html"
    style="width: 100%; height: 700px; border: none; border-radius: 8px;"
    title="Two Sum Sorted Array Infographic"
    loading="lazy"
  ></iframe>
  <p style="margin-top: 10px; font-size: 0.9em; color: #718096;">
    <a href="two_sum_sorted.html" target="_blank" style="color: #4299e1; text-decoration: none;">Open in new tab</a>
  </p>
</div>

## Key Concepts Visualized

- **Pointer Initialization**: Left at start, right at end
- **Sum Comparison**: Compare current sum to target
- **Pointer Movement**: Move left right if sum too small, move right left if sum too large
- **Convergence**: How pointers meet when solution is found

## Learning Tips

1. **Understand the Logic**: Pay attention to why we move each pointer
2. **Sorted Array Requirement**: Notice how this works because array is sorted
3. **Decision Making**: Watch the status message explaining each decision
4. **Step Counter**: See how few steps are needed (O(n) efficiency)

## Related Problems

Practice these problems after understanding the visualization:

- [Two Sum Sorted](../problems/two_sum_sorted.md)
- [Container With Most Water](../problems/container_with_most_water.md)
