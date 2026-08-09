---
comments: true
---

# Climbing Stairs

**Difficulty**: Easy  
**LeetCode**: [#70](https://leetcode.com/problems/climbing-stairs/)

## Problem Statement

You are climbing a staircase with n steps. You can climb 1 or 2 steps at a time. How many distinct ways can you climb to the top?

**Example**:
```
Input: n = 3
Output: 3
Explanation: Three ways: (1+1+1), (1+2), (2+1)
```

## Approach

This problem has optimal substructure:

- To reach step n, we must come from step n-1 or n-2
- Ways to reach step n = ways to reach n-1 + ways to reach n-2
- This is the Fibonacci sequence!

## Solution

```python
def climb_stairs(n):
    """
    Calculate number of ways to climb n stairs.
    
    Time Complexity: O(n) - compute each state once
    Space Complexity: O(1) - only track last two values
    """
    if n <= 2:
        return n
    
    # Base cases: 1 way to reach step 1, 2 ways to reach step 2
    prev2 = 1  # ways[0]
    prev1 = 2  # ways[1]
    
    # Build up from step 3 to n
    for i in range(3, n + 1):
        current = prev1 + prev2
        prev2 = prev1
        prev1 = current
    
    return prev1

# Alternative: Top-down with memoization
def climb_stairs_memo(n, memo=None):
    """Top-down DP approach with memoization."""
    if memo is None:
        memo = {}
    
    if n <= 2:
        return n
    
    if n in memo:
        return memo[n]
    
    memo[n] = climb_stairs_memo(n - 1, memo) + climb_stairs_memo(n - 2, memo)
    return memo[n]

# Test
print(climb_stairs(5))       # Output: 8
print(climb_stairs_memo(5))  # Output: 8
```

## Step-by-Step Walkthrough

```
n = 5

Bottom-up approach:
Step 1: 1 way (base case)
Step 2: 2 ways (base case)
Step 3: ways[3] = ways[2] + ways[1] = 2 + 1 = 3
  Ways: (1+1+1), (1+2), (2+1)
Step 4: ways[4] = ways[3] + ways[2] = 3 + 2 = 5
  Ways: (1+1+1+1), (1+1+2), (1+2+1), (2+1+1), (2+2)
Step 5: ways[5] = ways[4] + ways[3] = 5 + 3 = 8
  Ways: all ways to reach 4 then +1 step (5 ways)
        all ways to reach 3 then +2 steps (3 ways)

Result: 8
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
