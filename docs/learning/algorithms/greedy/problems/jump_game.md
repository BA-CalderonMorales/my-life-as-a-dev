# Jump Game

**Difficulty**: Medium  
**LeetCode**: [#55](https://leetcode.com/problems/jump-game/)

## Problem Statement

Given an array where each element represents your maximum jump length at that position, determine if you can reach the last index starting from the first index.

**Example**:
```
Input: nums = [2, 3, 1, 1, 4]
Output: true
Explanation: Jump 1 step from 0 to 1, then 3 steps to the last index

Input: nums = [3, 2, 1, 0, 4]
Output: false
Explanation: You will always arrive at index 3, which has 0 jump length
```

## Approach

Greedy approach: Track maximum reachable index

- Start from position 0
- At each position, update farthest reachable index
- If current position exceeds farthest, can't proceed
- If farthest reaches last index, return true

Always choosing maximum reach ensures we explore all possibilities.

## Solution

```python
def can_jump(nums):
    """
    Determine if can reach last index using greedy.
    
    Time Complexity: O(n) - single pass
    Space Complexity: O(1) - only tracking max reach
    """
    max_reach = 0
    
    for i in range(len(nums)):
        # Can't reach this position
        if i > max_reach:
            return False
        
        # Update maximum reachable position
        max_reach = max(max_reach, i + nums[i])
        
        # Reached or passed last index
        if max_reach >= len(nums) - 1:
            return True
    
    return False

# Test
print(can_jump([2, 3, 1, 1, 4]))  # Output: True
print(can_jump([3, 2, 1, 0, 4]))  # Output: False
```

## Step-by-Step Walkthrough

```
Example 1: nums = [2, 3, 1, 1, 4]

i=0, nums[0]=2:
  max_reach = max(0, 0+2) = 2
  Can reach up to index 2

i=1, nums[1]=3:
  1 <= 2 (reachable)
  max_reach = max(2, 1+3) = 4
  Can reach up to index 4 (last index!)
  Return True

Result: True

Example 2: nums = [3, 2, 1, 0, 4]

i=0, nums[0]=3:
  max_reach = max(0, 0+3) = 3
  Can reach up to index 3

i=1, nums[1]=2:
  1 <= 3 (reachable)
  max_reach = max(3, 1+2) = 3
  Still max 3

i=2, nums[2]=1:
  2 <= 3 (reachable)
  max_reach = max(3, 2+1) = 3
  Still max 3

i=3, nums[3]=0:
  3 <= 3 (reachable)
  max_reach = max(3, 3+0) = 3
  Can't advance beyond 3

i=4:
  4 > 3 (not reachable!)
  Return False

Result: False
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
