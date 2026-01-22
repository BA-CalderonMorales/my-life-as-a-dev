---
title: Sliding Window Pattern
description: Optimize contiguous sequence problems from O(n^2) to O(n) using the sliding window technique.
tags:
  - Algorithms
  - Interview
  - Python
comments: true
---

# Sliding Window Pattern

The sliding window pattern optimizes problems involving contiguous sequences in arrays or strings. It transforms brute force O(n^2) approaches into O(n) by maintaining a "window" that slides through the data.

<div class="grid cards" markdown>

-   :material-speedometer:{ .lg .middle } **Time Complexity**

    ---

    O(n) - single pass through the array

-   :material-memory:{ .lg .middle } **Space Complexity**

    ---

    O(1) to O(k) depending on window state

</div>

---

## When to Use

!!! tip "Pattern Recognition"

    Look for these keywords in problem statements:

    - "Contiguous subarray/substring"
    - "Maximum/minimum sum of k elements"
    - "Longest substring with condition"
    - "Find all anagrams"

| Signal | Example Problem |
|--------|-----------------|
| Fixed-size contiguous sum | Max sum of k consecutive elements |
| Variable-size with constraint | Longest substring without repeating chars |
| Sliding aggregation | Running average, moving median |

---

## Visual Explanation

```text
FIXED-SIZE WINDOW (k=3)
─────────────────────────────────────────────────────────────────────

Array: [ 1 | 3 | 2 | 6 | -1 | 4 | 1 | 8 | 2 ]
        ─────────
        Window 1
        Sum = 6

Array: [ 1 | 3 | 2 | 6 | -1 | 4 | 1 | 8 | 2 ]
            ─────────
            Window 2
            Sum = 11  (subtract 1, add 6)

Array: [ 1 | 3 | 2 | 6 | -1 | 4 | 1 | 8 | 2 ]
                ─────────
                Window 3
                Sum = 7   (subtract 3, add -1)


VARIABLE-SIZE WINDOW
─────────────────────────────────────────────────────────────────────

String: "abcabcbb"  - Find longest substring without repeating chars

Step 1: "a"         window = {a}, len = 1
Step 2: "ab"        window = {a,b}, len = 2
Step 3: "abc"       window = {a,b,c}, len = 3  <-- current max
Step 4: "abca"      DUPLICATE! Contract from left
        "bca"       window = {b,c,a}, len = 3
Step 5: "bcab"      DUPLICATE! Contract from left
        "cab"       window = {c,a,b}, len = 3
...
```

---

## Core Approach

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SLIDING WINDOW ALGORITHM                            │
└─────────────────────────────────────────────────────────────────────────────┘

    1. INITIALIZE
       └── left = 0, result = initial_value, window_state = {}

    2. EXPAND (for each right in 0..n-1)
       └── Add arr[right] to window_state

    3. CONTRACT (while window is invalid)
       └── Remove arr[left] from window_state
       └── left++

    4. UPDATE RESULT
       └── result = best(result, current_window)

    5. RETURN result
```

### Two Main Types

| Type | When to Use | Example |
|------|-------------|---------|
| **Fixed-Size** | Window size is given (k) | Max sum of k elements |
| **Variable-Size** | Window size depends on condition | Longest valid substring |

---

## Template Code

```python
def sliding_window_fixed(arr, k):
    """Fixed-size sliding window template."""
    n = len(arr)
    if n < k:
        return None
    
    # Compute first window
    window_sum = sum(arr[:k])
    result = window_sum
    
    # Slide the window
    for right in range(k, n):
        window_sum += arr[right] - arr[right - k]  # Add new, remove old
        result = max(result, window_sum)
    
    return result


def sliding_window_variable(s):
    """Variable-size sliding window template."""
    left = 0
    result = 0
    char_set = set()
    
    for right in range(len(s)):
        # Contract while invalid
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        
        # Expand
        char_set.add(s[right])
        
        # Update result
        result = max(result, right - left + 1)
    
    return result
```

---

## Practice Problems

| Problem | Difficulty | Key Concept | Link |
|---------|------------|-------------|------|
| Maximum Sum Subarray of Size K | Easy | Fixed-size | [Solution](problems/max_sum_subarray_k.md) |
| Longest Substring Without Repeating | Medium | Variable-size, hash set | [Solution](problems/longest_substring_no_repeat.md) |
| Minimum Window Substring | Hard | Variable-size, hash map | [LC 76](https://leetcode.com/problems/minimum-window-substring/) |

---

## Key Takeaways

<div class="grid" markdown>

!!! success "Do This"

    - Identify if window size is fixed or variable
    - Use hash maps for character/element counts
    - Update state incrementally (add new, remove old)

!!! danger "Avoid This"

    - Off-by-one errors with window boundaries
    - Forgetting to update state when contracting
    - Recomputing window sum from scratch each time

</div>

---

## LeetCode Practice

- [3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)
- [76. Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/)
- [438. Find All Anagrams in a String](https://leetcode.com/problems/find-all-anagrams-in-a-string/)
- [209. Minimum Size Subarray Sum](https://leetcode.com/problems/minimum-size-subarray-sum/)
