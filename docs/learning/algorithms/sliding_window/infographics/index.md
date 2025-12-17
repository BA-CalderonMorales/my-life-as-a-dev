# Sliding Window - Infographics

Interactive visualizations to help you understand how the Sliding Window pattern works under the hood.

## Available Infographics

### Maximum Sum Subarray

An interactive visualization showing how the sliding window technique finds the maximum sum of k consecutive elements efficiently.

<div class="infographic-container" style="margin: 20px 0; padding: 20px; background: #f7fafc; border-radius: 8px; border: 2px solid #e2e8f0;">
  <h4 style="margin-top: 0;">Interactive Demo: Maximum Sum Subarray</h4>
  <p style="margin-bottom: 15px;">Watch how the window slides across the array, efficiently calculating sums by removing the leftmost element and adding the new rightmost element.</p>
  <iframe 
    src="max_subarray.html"
    style="width: 100%; height: 700px; border: none; border-radius: 8px;"
    title="Maximum Sum Subarray Infographic"
    loading="lazy"
  ></iframe>
  <p style="margin-top: 10px; font-size: 0.9em; color: #718096;">
    <a href="max_subarray.html" target="_blank" style="color: #4299e1; text-decoration: none;">Open in new tab</a>
  </p>
</div>

## Key Concepts Visualized

- **Window Initialization**: Calculate sum of first k elements
- **Window Sliding**: Remove left element, add right element
- **Sum Updates**: Efficient O(1) updates instead of O(k) recalculation
- **Maximum Tracking**: Keep track of the best window seen so far

## Learning Tips

1. **Watch the Pattern**: Notice how only two array positions change per step
2. **Compare to Brute Force**: Think about how this beats recalculating every window
3. **Speed Control**: Slow down to see the add/remove operations clearly
4. **Track the Stats**: Watch how current sum and max sum update

## Related Problems

Practice these problems after understanding the visualization:

- [Max Sum Subarray K](../problems/max_sum_subarray_k.md)
- [Longest Substring No Repeat](../problems/longest_substring_no_repeat.md)
