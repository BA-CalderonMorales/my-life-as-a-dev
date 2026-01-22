---
comments: true
---

# Container With Most Water

**Difficulty**: Medium  
**LeetCode**: [#11](https://leetcode.com/problems/container-with-most-water/)

## Problem Statement

Given an array of heights representing vertical lines, find two lines that together with x-axis form a container that holds the most water.

**Example**:
```
Input: height = [1, 8, 6, 2, 5, 4, 8, 3, 7]
Output: 49
Explanation: Container formed by heights at index 1 and 8 (8 and 7)
```

## Approach

Water capacity = min(height[left], height[right]) * (right - left)

Strategy:

- Start with widest container (pointers at ends)
- Move pointer with shorter height inward
- Track maximum area seen

Why move shorter height? Moving taller height can only decrease area (width decreases, height can't increase past shorter one).

## Solution

```python
def max_area(height):
    """
    Find maximum water container area.
    
    Time Complexity: O(n) - single pass
    Space Complexity: O(1) - only pointers
    """
    left = 0
    right = len(height) - 1
    max_water = 0
    
    while left < right:
        # Calculate current area
        width = right - left
        current_height = min(height[left], height[right])
        current_area = width * current_height
        max_water = max(max_water, current_area)
        
        # Move pointer with shorter height
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    
    return max_water

# Test
height = [1, 8, 6, 2, 5, 4, 8, 3, 7]
print(max_area(height))  # Output: 49
```

## Step-by-Step Walkthrough

```
height = [1, 8, 6, 2, 5, 4, 8, 3, 7]
         [0, 1, 2, 3, 4, 5, 6, 7, 8]

left=0 (h=1), right=8 (h=7):
  area = min(1, 7) * 8 = 1 * 8 = 8
  max_water = 8
  height[left] < height[right], move left

left=1 (h=8), right=8 (h=7):
  area = min(8, 7) * 7 = 7 * 7 = 49
  max_water = 49
  height[left] > height[right], move right

left=1 (h=8), right=7 (h=3):
  area = min(8, 3) * 6 = 3 * 6 = 18
  max_water = 49 (unchanged)
  height[left] > height[right], move right

left=1 (h=8), right=6 (h=8):
  area = min(8, 8) * 5 = 8 * 5 = 40
  max_water = 49 (unchanged)
  heights equal, move right

Continue until left >= right...

Result: 49
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
