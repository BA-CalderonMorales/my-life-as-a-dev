---
comments: true
---

# Subsets

**Difficulty**: Medium  
**LeetCode**: [#78](https://leetcode.com/problems/subsets/)

## Problem Statement

Given an array of unique integers, return all possible subsets (the power set).

**Example**:
```
Input: nums = [1, 2, 3]
Output: [[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]]
```

## Approach

For each element, we have two choices:

1. Include it in current subset
2. Don't include it

Build subsets by making these choices recursively.

## Solution

```python
def subsets(nums):
    """
    Generate all subsets of nums.
    
    Time Complexity: O(2^n) - 2^n subsets to generate
    Space Complexity: O(n) - recursion depth
    """
    result = []
    
    def backtrack(start, current):
        """
        Build subsets starting from index start.
        
        Args:
            start: Index to start considering elements
            current: Current subset being built
        """
        # Add current subset to result
        result.append(current[:])  # Make a copy
        
        # Try adding each remaining element
        for i in range(start, len(nums)):
            # Choose: add nums[i] to current subset
            current.append(nums[i])
            
            # Explore: recursively build subsets
            backtrack(i + 1, current)
            
            # Unchoose: remove nums[i] (backtrack)
            current.pop()
    
    backtrack(0, [])
    return result

# Alternative: Iterative approach
def subsets_iterative(nums):
    """Generate subsets iteratively."""
    result = [[]]  # Start with empty subset
    
    for num in nums:
        # For each existing subset, create new subset with num added
        result += [curr + [num] for curr in result]
    
    return result

# Test
nums = [1, 2, 3]
print(subsets(nums))
# Output: [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
```

## Step-by-Step Walkthrough

```
nums = [1, 2, 3]

backtrack(0, [])
  Add [] to result
  
  i=0: Choose 1
    backtrack(1, [1])
      Add [1] to result
      
      i=1: Choose 2
        backtrack(2, [1,2])
          Add [1,2] to result
          
          i=2: Choose 3
            backtrack(3, [1,2,3])
              Add [1,2,3] to result
              No more elements
            Unchoose 3: [1,2]
        Unchoose 2: [1]
      
      i=2: Choose 3
        backtrack(3, [1,3])
          Add [1,3] to result
          No more elements
        Unchoose 3: [1]
    Unchoose 1: []
  
  i=1: Choose 2
    backtrack(2, [2])
      Add [2] to result
      
      i=2: Choose 3
        backtrack(3, [2,3])
          Add [2,3] to result
          No more elements
        Unchoose 3: [2]
    Unchoose 2: []
  
  i=2: Choose 3
    backtrack(3, [3])
      Add [3] to result
      No more elements
    Unchoose 3: []

Result: [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
