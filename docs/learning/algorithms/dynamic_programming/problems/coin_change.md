# Coin Change

**Difficulty**: Medium  
**LeetCode**: [#322](https://leetcode.com/problems/coin-change/)

## Problem Statement

You are given an array of coin denominations and a target amount. Find the minimum number of coins needed to make up that amount. If impossible, return -1.

**Example**:
```
Input: coins = [1, 2, 5], amount = 11
Output: 3
Explanation: 11 = 5 + 5 + 1 (3 coins)
```

## Approach

For each amount, try using each coin and take the minimum:

- If we use coin c for amount a, we need 1 + minimum coins for (a - c)
- Try all coins and take the best result

**Recurrence**: `dp[amount] = 1 + min(dp[amount - coin] for each coin)`

## Solution

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

## Step-by-Step Walkthrough

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

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
