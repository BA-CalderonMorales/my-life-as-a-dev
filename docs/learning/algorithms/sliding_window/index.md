# Sliding Window Pattern

The sliding window pattern is a powerful technique for solving problems involving contiguous sequences within arrays or strings. It optimizes brute force approaches from O(n^2) to O(n) by maintaining a "window" that slides through the data.

## Visual Learning

Want to see this pattern in action? Check out our [interactive infographics](infographics/index.md) that visualize how the sliding window moves and calculates efficiently.

## When to Use Sliding Window

Use this pattern when you need to:


- Find optimal contiguous subarrays or substrings
- Track elements within a fixed or variable window size
- Aggregate data over ranges efficiently
- Minimize or maximize values in sequences

## Core Approach

The sliding window technique involves:

1. **Initialize Window**: Start with a window at the beginning of the array
2. **Expand Window**: Grow the window by moving the right boundary
3. **Process Window**: Update aggregates or check conditions
4. **Contract Window**: Shrink from the left when conditions are met or violated
5. **Track Result**: Maintain the best result found so far

### Two Main Types

**Fixed-Size Window**: Window size remains constant throughout

- Move both pointers together
- Simple implementation

**Variable-Size Window**: Window expands and contracts based on conditions

- Expand right pointer to grow window
- Contract left pointer to shrink window
- More complex but handles dynamic constraints

## Template Pattern

```python
def sliding_window_template(arr, condition):
    """General sliding window template."""
    left = 0
    result = initial_value
    window_state = {}  # Track window contents
    
    for right in range(len(arr)):
        # Expand: add arr[right] to window
        update_window(window_state, arr[right])
        
        # Contract: shrink window if condition violated
        while window_invalid(window_state, condition):
            remove_from_window(window_state, arr[left])
            left += 1
        
        # Update result
        result = update_result(result, right - left + 1)
    
    return result
```

## Practice Problems

Work through these problems to master the sliding window pattern:

| Problem | Difficulty | Key Concept |
|---------|------------|-------------|
| [Maximum Sum Subarray of Size K](problems/max_sum_subarray_k.md) | Easy | Fixed-size window |
| [Longest Substring Without Repeating Characters](problems/longest_substring_no_repeat.md) | Medium | Variable-size window |

## Key Takeaways

1. **Avoid Nested Loops**: Transform O(n^2) to O(n)
2. **Window State**: Track what's in the current window efficiently
3. **Two Pointers**: Left and right boundaries define the window
4. **Incremental Updates**: Add/remove elements as window moves

## Practice Tips

- Identify if window size is fixed or variable
- Determine what state to track in the window
- Consider using hash maps for character/element counts
- Handle edge cases: empty input, window larger than array
- Visualize the window movement

## Common Mistakes

- Off-by-one errors with window boundaries
- Not properly updating window state when contracting
- Forgetting to handle edge cases
- Using wrong condition for window expansion/contraction

## LeetCode Practice

- [3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)
- [76. Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/)
- [438. Find All Anagrams in a String](https://leetcode.com/problems/find-all-anagrams-in-a-string/)
