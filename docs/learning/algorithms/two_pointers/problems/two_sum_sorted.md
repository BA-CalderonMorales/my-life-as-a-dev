---
comments: true
---

# Two Sum II - Input Array Is Sorted

**Difficulty**: Medium  
**LeetCode**: [#167](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)

## Problem Statement

Given a sorted array of integers, find two numbers that add up to a target. Return the indices (1-indexed).

**Example**:
```
Input: numbers = [2, 7, 11, 15], target = 9
Output: [1, 2]
Explanation: 2 + 7 = 9
```

## Approach

Since array is sorted:

- Start with pointers at both ends
- If sum too small, move left pointer right
- If sum too large, move right pointer left
- If sum equals target, found answer

## Solution

```python
def two_sum(numbers, target):
    """
    Find two numbers that sum to target in sorted array.
    
    Time Complexity: O(n) - single pass with two pointers
    Space Complexity: O(1) - only using pointers
    """
    left = 0
    right = len(numbers) - 1
    
    while left < right:
        current_sum = numbers[left] + numbers[right]
        
        if current_sum == target:
            return [left + 1, right + 1]  # 1-indexed
        elif current_sum < target:
            left += 1  # Need larger sum
        else:
            right -= 1  # Need smaller sum
    
    return []  # No solution found

# Test
numbers = [2, 7, 11, 15]
target = 9
print(two_sum(numbers, target))  # Output: [1, 2]
```

## Step-by-Step Walkthrough

```
numbers = [2, 7, 11, 15], target = 9

Initial: left=0 (2), right=3 (15)

Iteration 1: 2 + 15 = 17 > 9
  Sum too large, move right left
  right = 2

Iteration 2: left=0 (2), right=2 (11)
  2 + 11 = 13 > 9
  Sum too large, move right left
  right = 1

Iteration 3: left=0 (2), right=1 (7)
  2 + 7 = 9 = target
  Found answer!

Result: [1, 2] (1-indexed)
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
