# Maximum Sum Subarray of Size K

**Difficulty**: Easy  
**LeetCode**: Similar to [#643 Maximum Average Subarray I](https://leetcode.com/problems/maximum-average-subarray-i/)

## Problem Statement

Given an array of integers and a number k, find the maximum sum of any contiguous subarray of size k.

**Example**:
```
Input: arr = [2, 1, 5, 1, 3, 2], k = 3
Output: 9
Explanation: Subarray [5, 1, 3] has maximum sum of 9
```

## Approach

This is a classic fixed-size sliding window problem:

1. Calculate sum of first k elements (initial window)
2. Slide window one position at a time
3. Remove leftmost element, add new rightmost element
4. Track maximum sum seen

## Solution

```python
def max_sum_subarray(arr, k):
    """
    Find maximum sum of any subarray of size k.
    
    Time Complexity: O(n) - single pass through array
    Space Complexity: O(1) - only tracking window sum and max
    """
    if not arr or len(arr) < k:
        return 0
    
    # Calculate sum of first window
    window_sum = sum(arr[:k])
    max_sum = window_sum
    
    # Slide window through rest of array
    for i in range(k, len(arr)):
        # Add new element, remove old element
        window_sum = window_sum + arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
    
    return max_sum

# Test
arr = [2, 1, 5, 1, 3, 2]
k = 3
print(max_sum_subarray(arr, k))  # Output: 9
```

## Step-by-Step Walkthrough

```
arr = [2, 1, 5, 1, 3, 2], k = 3

Initial window [2, 1, 5]:
  window_sum = 2 + 1 + 5 = 8
  max_sum = 8

Slide to [1, 5, 1]:
  window_sum = 8 + 1 - 2 = 7
  max_sum = 8 (unchanged)

Slide to [5, 1, 3]:
  window_sum = 7 + 3 - 1 = 9
  max_sum = 9 (updated)

Slide to [1, 3, 2]:
  window_sum = 9 + 2 - 5 = 6
  max_sum = 9 (unchanged)

Result: 9
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
