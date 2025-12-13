# Dynamic Programming Pattern

Dynamic Programming (DP) is a method for solving complex problems by breaking them down into simpler overlapping subproblems. It optimizes recursive solutions by storing results to avoid redundant calculations.

## When to Use Dynamic Programming

Use DP when you encounter:

- Overlapping subproblems (same subproblem solved multiple times)
- Optimal substructure (optimal solution built from optimal subsolutions)
- Counting or optimization problems
- Problems with multiple ways to reach the same state

## Core Approach

### The DP Process

1. **Define State**: What information do we need to track?
2. **Identify Recurrence**: How do smaller subproblems relate to larger ones?
3. **Base Cases**: What are the simplest cases we know?
4. **Compute Order**: Bottom-up or top-down with memoization?
5. **Extract Answer**: Get final result from computed states

### Top-Down vs Bottom-Up

- **Top-Down (Memoization)**
    - Start with original problem
    - Recursively solve subproblems
    - Cache results to avoid recomputation
    - More intuitive, easier to write

- **Bottom-Up (Tabulation)**
    - Start with base cases
    - Build up to final solution
    - Iterative approach
    - Usually more efficient (no recursion overhead)

## Problem 1: Climbing Stairs

**Difficulty**: Easy  
**LeetCode**: #70

### Problem Statement

You are climbing a staircase with n steps. You can climb 1 or 2 steps at a time. How many distinct ways can you climb to the top?

**Example**:
```
Input: n = 3
Output: 3
Explanation: Three ways: (1+1+1), (1+2), (2+1)
```

### Approach

This problem has optimal substructure:
- To reach step n, we must come from step n-1 or n-2
- Ways to reach step n = ways to reach n-1 + ways to reach n-2
- This is the Fibonacci sequence!

### Solution

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

### Step-by-Step Walkthrough

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

## Problem 2: House Robber

**Difficulty**: Medium  
**LeetCode**: #198

### Problem Statement

You are a robber planning to rob houses along a street. Each house has a certain amount of money. Adjacent houses have security systems that alert police if two adjacent houses are broken into on the same night.

Given an array of integers representing the amount of money at each house, determine the maximum amount you can rob without alerting the police.

**Example**:
```
Input: nums = [2, 7, 9, 3, 1]
Output: 12
Explanation: Rob house 0 (2), house 2 (9), and house 4 (1) = 2 + 9 + 1 = 12
```

### Approach

At each house, we have two choices:
1. Rob this house + max from houses up to i-2
2. Skip this house + max from houses up to i-1

Take the maximum of these two options.

**Recurrence**: `dp[i] = max(nums[i] + dp[i-2], dp[i-1])`

### Solution

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

### Step-by-Step Walkthrough

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

## Problem 3: Coin Change

**Difficulty**: Medium  
**LeetCode**: #322

### Problem Statement

You are given an array of coin denominations and a target amount. Find the minimum number of coins needed to make up that amount. If impossible, return -1.

**Example**:
```
Input: coins = [1, 2, 5], amount = 11
Output: 3
Explanation: 11 = 5 + 5 + 1 (3 coins)
```

### Approach

For each amount, try using each coin and take the minimum:
- If we use coin c for amount a, we need 1 + minimum coins for (a - c)
- Try all coins and take the best result

**Recurrence**: `dp[amount] = 1 + min(dp[amount - coin] for each coin)`

### Solution

```python
def coin_change(coins, amount):
    """
    Find minimum number of coins to make amount.
    
    Time Complexity: O(amount * len(coins)) - fill dp array
    Space Complexity: O(amount) - dp array
    """
    # Initialize dp array with impossible value
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0  # Base case: 0 coins for amount 0
    
    # Build up solutions for amounts 1 to target
    for current_amount in range(1, amount + 1):
        # Try each coin
        for coin in coins:
            if coin <= current_amount:
                # Use this coin + min coins for remaining amount
                dp[current_amount] = min(
                    dp[current_amount],
                    1 + dp[current_amount - coin]
                )
    
    # Return result or -1 if impossible
    return dp[amount] if dp[amount] != float('inf') else -1

# Alternative: Top-down with memoization
def coin_change_memo(coins, amount, memo=None):
    """Top-down DP approach."""
    if memo is None:
        memo = {}
    
    # Base cases
    if amount == 0:
        return 0
    if amount < 0:
        return -1
    
    if amount in memo:
        return memo[amount]
    
    # Try each coin
    min_coins = float('inf')
    for coin in coins:
        result = coin_change_memo(coins, amount - coin, memo)
        if result >= 0:  # Valid solution found
            min_coins = min(min_coins, 1 + result)
    
    # Store result
    memo[amount] = min_coins if min_coins != float('inf') else -1
    return memo[amount]

# Test
coins = [1, 2, 5]
amount = 11
print(coin_change(coins, amount))       # Output: 3
print(coin_change_memo(coins, amount))  # Output: 3
```

### Step-by-Step Walkthrough

```
coins = [1, 2, 5], amount = 11

Initialize: dp = [0, inf, inf, inf, inf, inf, inf, inf, inf, inf, inf, inf]

Amount 1:
  Try coin 1: dp[1] = min(inf, 1 + dp[0]) = min(inf, 1) = 1

Amount 2:
  Try coin 1: dp[2] = min(inf, 1 + dp[1]) = min(inf, 2) = 2
  Try coin 2: dp[2] = min(2, 1 + dp[0]) = min(2, 1) = 1

Amount 3:
  Try coin 1: dp[3] = min(inf, 1 + dp[2]) = min(inf, 2) = 2
  Try coin 2: dp[3] = min(2, 1 + dp[1]) = min(2, 2) = 2

Amount 4:
  Try coin 1: dp[4] = min(inf, 1 + dp[3]) = 3
  Try coin 2: dp[4] = min(3, 1 + dp[2]) = min(3, 2) = 2

Amount 5:
  Try coin 1: dp[5] = min(inf, 1 + dp[4]) = 3
  Try coin 2: dp[5] = min(3, 1 + dp[3]) = 3
  Try coin 5: dp[5] = min(3, 1 + dp[0]) = min(3, 1) = 1

Continue building...

Amount 11:
  Try coin 1: dp[11] = min(?, 1 + dp[10]) = min(?, 1 + 2) = 3
  Try coin 2: dp[11] = min(3, 1 + dp[9]) = min(3, 1 + 3) = 3
  Try coin 5: dp[11] = min(3, 1 + dp[6]) = min(3, 1 + 2) = 3

Result: 3 (using 5 + 5 + 1)
```

## Key Takeaways

1. **Identify Subproblems**: Break problem into smaller versions
2. **Define State**: Choose what information to track
3. **Find Recurrence**: Express solution in terms of subproblems
4. **Avoid Recomputation**: Use memoization or tabulation
5. **Space Optimization**: Often can reduce from O(n) to O(1)

## Common DP Patterns

### 1D DP (Linear)
- Fibonacci-like sequences
- House robber problems
- Decode ways
- Jump game

### 2D DP (Grid)
- Longest common subsequence
- Edit distance
- Unique paths
- Matrix chain multiplication

### State Machine DP
- Stock trading problems
- Different states with transitions
- Track current state in DP

## Practice Tips

- Start by writing recursive solution
- Identify overlapping subproblems
- Add memoization to recursive solution
- Convert to bottom-up if needed
- Look for space optimization opportunities
- Draw the dp array/table to visualize

## Common Mistakes to Avoid

- Forgetting base cases
- Wrong order of computation (bottom-up)
- Not initializing dp array correctly
- Missing edge cases (empty input, single element)
- Overcomplicating the state definition

## Practice on LeetCode

- [70. Climbing Stairs](https://leetcode.com/problems/climbing-stairs/)
- [322. Coin Change](https://leetcode.com/problems/coin-change/)
- [1143. Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/)
