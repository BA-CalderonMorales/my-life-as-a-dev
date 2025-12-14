# Koko Eating Bananas

**Difficulty**: Medium  
**LeetCode**: [#875](https://leetcode.com/problems/koko-eating-bananas/)

## Problem Statement

Koko loves bananas. There are N piles of bananas, where pile i has piles[i] bananas. The guards will return in H hours. Koko can decide her eating speed k (bananas per hour). Each hour, she chooses a pile and eats k bananas. If the pile has fewer than k bananas, she eats them all and won't eat more that hour.

Find the minimum eating speed k so she can eat all bananas within H hours.

**Example**:
```
Input: piles = [3, 6, 7, 11], h = 8
Output: 4
Explanation: Speed 4 allows eating all bananas in 8 hours
```

## Approach

Key observations:

- Minimum speed: 1 banana/hour
- Maximum speed: max(piles) - eat any pile in 1 hour
- For any speed k, we can calculate hours needed
- If speed k works, any speed > k also works (monotonic)

Binary search for minimum speed that works.

## Solution

```python
import math

def min_eating_speed(piles, h):
    """
    Find minimum eating speed to finish all bananas in h hours.
    
    Time Complexity: O(n * log(max(piles))) - binary search * validation
    Space Complexity: O(1) - only using pointers
    """
    def can_eat_all_with_speed(k):
        """Check if can eat all bananas with speed k in h hours."""
        hours_needed = 0
        for pile in piles:
            # Ceiling division: hours to eat this pile
            hours_needed += math.ceil(pile / k)
        return hours_needed <= h
    
    # Search space: [1, max pile size]
    left = 1
    right = max(piles)
    
    # Binary search for minimum speed
    while left < right:
        mid = (left + right) // 2
        
        if can_eat_all_with_speed(mid):
            # This speed works, try slower
            right = mid
        else:
            # This speed too slow, need faster
            left = mid + 1
    
    return left

# Test
piles = [3, 6, 7, 11]
h = 8
print(min_eating_speed(piles, h))  # Output: 4
```

## Step-by-Step Walkthrough

```
piles = [3, 6, 7, 11], h = 8

Search space: [1, 11 (max pile)]

Iteration 1: mid = (1 + 11) // 2 = 6
  Can eat with speed 6?
    Pile 3: ceil(3/6) = 1 hour
    Pile 6: ceil(6/6) = 1 hour
    Pile 7: ceil(7/6) = 2 hours
    Pile 11: ceil(11/6) = 2 hours
    Total: 6 hours <= 8 hours
  Works! Try slower: right = 6

Iteration 2: mid = (1 + 6) // 2 = 3
  Can eat with speed 3?
    Pile 3: ceil(3/3) = 1 hour
    Pile 6: ceil(6/3) = 2 hours
    Pile 7: ceil(7/3) = 3 hours
    Pile 11: ceil(11/3) = 4 hours
    Total: 10 hours > 8 hours
  Doesn't work! Need faster: left = 4

Iteration 3: mid = (4 + 6) // 2 = 5
  Can eat with speed 5?
    Total: 8 hours <= 8 hours
  Works! Try slower: right = 5

Iteration 4: mid = (4 + 5) // 2 = 4
  Can eat with speed 4?
    Pile 3: ceil(3/4) = 1 hour
    Pile 6: ceil(6/4) = 2 hours
    Pile 7: ceil(7/4) = 2 hours
    Pile 11: ceil(11/4) = 3 hours
    Total: 8 hours <= 8 hours
  Works! Try slower: right = 4

left = right = 4, exit loop

Result: 4
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
