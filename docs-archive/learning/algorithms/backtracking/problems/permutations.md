---
comments: true
---

# Permutations

**Difficulty**: Medium  
**LeetCode**: [#46](https://leetcode.com/problems/permutations/)

## Problem Statement

Given an array of distinct integers, return all possible permutations.

**Example**:
```
Input: nums = [1, 2, 3]
Output: [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
```

## Approach

Build permutations by:

1. For each unused element, add it to current permutation
2. Recursively build rest of permutation
3. Remove element and try next option

Track which elements are used to avoid duplicates.

## Solution

```python
def permute(nums):
    """
    Generate all permutations of nums.
    
    Time Complexity: O(n! * n) - n! permutations, n to copy each
    Space Complexity: O(n) - recursion depth
    """
    result = []
    
    def backtrack(current, remaining):
        """
        Build permutations with current built and remaining elements.
        
        Args:
            current: Current permutation being built
            remaining: Elements not yet used
        """
        # Base case: no remaining elements
        if not remaining:
            result.append(current[:])
            return
        
        # Try each remaining element
        for i in range(len(remaining)):
            # Choose: add remaining[i] to permutation
            element = remaining[i]
            current.append(element)
            
            # Explore: recurse with remaining elements
            new_remaining = remaining[:i] + remaining[i+1:]
            backtrack(current, new_remaining)
            
            # Unchoose: remove element (backtrack)
            current.pop()
    
    backtrack([], nums)
    return result

# Alternative: Using a used set
def permute_with_set(nums):
    """Generate permutations tracking used elements."""
    result = []
    used = set()
    
    def backtrack(current):
        if len(current) == len(nums):
            result.append(current[:])
            return
        
        for num in nums:
            if num not in used:
                # Choose
                used.add(num)
                current.append(num)
                
                # Explore
                backtrack(current)
                
                # Unchoose
                current.pop()
                used.remove(num)
    
    backtrack([])
    return result

# Test
nums = [1, 2, 3]
print(permute(nums))
# Output: [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
```

## Step-by-Step Walkthrough

```
nums = [1, 2, 3]

backtrack([], [1,2,3])
  
  i=0: Choose 1
    backtrack([1], [2,3])
      
      i=0: Choose 2
        backtrack([1,2], [3])
          
          i=0: Choose 3
            backtrack([1,2,3], [])
              Add [1,2,3] to result
          Unchoose 3
      Unchoose 2
      
      i=1: Choose 3
        backtrack([1,3], [2])
          
          i=0: Choose 2
            backtrack([1,3,2], [])
              Add [1,3,2] to result
          Unchoose 2
      Unchoose 3
    Unchoose 1
  
  i=1: Choose 2
    backtrack([2], [1,3])
      ... generates [2,1,3] and [2,3,1]
    Unchoose 2
  
  i=2: Choose 3
    backtrack([3], [1,2])
      ... generates [3,1,2] and [3,2,1]
    Unchoose 3

Result: [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
