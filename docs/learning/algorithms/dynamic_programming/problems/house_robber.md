# House Robber

**Difficulty**: Medium  
**LeetCode**: [#198](https://leetcode.com/problems/house-robber/)

## Problem Statement

You are a robber planning to rob houses along a street. Each house has a certain amount of money. Adjacent houses have security systems that alert police if two adjacent houses are broken into on the same night.

Given an array of integers representing the amount of money at each house, determine the maximum amount you can rob without alerting the police.

**Example**:
```
Input: nums = [2, 7, 9, 3, 1]
Output: 12
Explanation: Rob house 0 (2), house 2 (9), and house 4 (1) = 2 + 9 + 1 = 12
```

## Approach

At each house, we have two choices:

1. Rob this house + max from houses up to i-2
2. Skip this house + max from houses up to i-1

Take the maximum of these two options.

**Recurrence**: `dp[i] = max(nums[i] + dp[i-2], dp[i-1])`

## Solution

```python
def rob(nums):
    """
    Calculate maximum money that can be robbed.
    
    Time Complexity: O(n) - single pass through houses
    Space Complexity: O(1) - only track last two states
    """
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
    
    # Track max money up to previous two houses
    prev2 = nums[0]  # max at house 0
    prev1 = max(nums[0], nums[1])  # max at house 1
    
    # Process remaining houses
    for i in range(2, len(nums)):
        current = max(nums[i] + prev2, prev1)
        prev2 = prev1
        prev1 = current
    
    return prev1

# Alternative: Bottom-up with full array
def rob_array(nums):
    """DP with explicit array (easier to understand)."""
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
    
    dp = [0] * len(nums)
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])
    
    for i in range(2, len(nums)):
        # Either rob current + max up to i-2, or skip current
        dp[i] = max(nums[i] + dp[i - 2], dp[i - 1])
    
    return dp[-1]

# Test
nums = [2, 7, 9, 3, 1]
print(rob(nums))        # Output: 12
print(rob_array(nums))  # Output: 12
```

## Step-by-Step Walkthrough

```
nums = [2, 7, 9, 3, 1]

Build DP array:
dp[0] = 2 (only option: rob house 0)
dp[1] = max(2, 7) = 7 (better to rob house 1)

dp[2]: Rob house 2 or not?
  - Rob: 9 + dp[0] = 9 + 2 = 11
  - Skip: dp[1] = 7
  - Choose: max(11, 7) = 11

dp[3]: Rob house 3 or not?
  - Rob: 3 + dp[1] = 3 + 7 = 10
  - Skip: dp[2] = 11
  - Choose: max(10, 11) = 11

dp[4]: Rob house 4 or not?
  - Rob: 1 + dp[2] = 1 + 11 = 12
  - Skip: dp[3] = 11
  - Choose: max(12, 11) = 12

Result: 12 (rob houses at indices 0, 2, 4)
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
