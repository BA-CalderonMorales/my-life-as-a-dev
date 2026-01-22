---
comments: true
---

# Capacity To Ship Packages Within D Days

**Difficulty**: Medium  
**LeetCode**: [#1011](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/)

## Problem Statement

A conveyor belt has packages that must be shipped within D days. Each package has a weight, and you need to find the minimum ship capacity to ship all packages within D days. Packages must be shipped in order.

**Example**:
```
Input: weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5
Output: 15
Explanation: Ship with capacity 15 can ship all packages in 5 days
```

## Approach

Key observations:

- Minimum capacity: maximum single package weight (must fit largest)
- Maximum capacity: sum of all weights (ship everything in 1 day)
- For any capacity, we can check if it allows shipping in D days
- If capacity C works, any capacity > C also works (monotonic)

Binary search for the minimum capacity that works.

## Solution

```python
def ship_within_days(weights, days):
    """
    Find minimum ship capacity to ship all packages within days.
    
    Time Complexity: O(n * log(sum(weights))) - binary search * validation
    Space Complexity: O(1) - only using pointers
    """
    def can_ship_with_capacity(capacity):
        """Check if we can ship all packages within days using this capacity."""
        days_needed = 1
        current_load = 0
        
        for weight in weights:
            if current_load + weight > capacity:
                # Need a new day
                days_needed += 1
                current_load = weight
            else:
                current_load += weight
        
        return days_needed <= days
    
    # Search space: [max single package, sum of all packages]
    left = max(weights)
    right = sum(weights)
    
    # Binary search for minimum capacity
    while left < right:
        mid = (left + right) // 2
        
        if can_ship_with_capacity(mid):
            # This capacity works, try smaller
            right = mid
        else:
            # This capacity doesn't work, need larger
            left = mid + 1
    
    return left

# Test
weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
days = 5
print(ship_within_days(weights, days))  # Output: 15
```

## Step-by-Step Walkthrough

```
weights = [1,2,3,4,5,6,7,8,9,10], days = 5

Search space: [10 (max weight), 55 (sum of all)]

Iteration 1: mid = (10 + 55) // 2 = 32
  Can ship with capacity 32?
    Day 1: 1+2+3+4+5+6+7 = 28
    Day 2: 8+9+10 = 27
    Total: 2 days <= 5 days
  Works! Try smaller: right = 32

Iteration 2: mid = (10 + 32) // 2 = 21
  Can ship with capacity 21?
    Day 1: 1+2+3+4+5+6 = 21
    Day 2: 7+8 = 15
    Day 3: 9+10 = 19
    Total: 3 days <= 5 days
  Works! Try smaller: right = 21

Iteration 3: mid = (10 + 21) // 2 = 15
  Can ship with capacity 15?
    Day 1: 1+2+3+4+5 = 15
    Day 2: 6+7 = 13
    Day 3: 8 = 8
    Day 4: 9 = 9
    Day 5: 10 = 10
    Total: 5 days <= 5 days
  Works! Try smaller: right = 15

Iteration 4: mid = (10 + 15) // 2 = 12
  Can ship with capacity 12?
    Day 1: 1+2+3+4 = 10
    Day 2: 5+6 = 11
    Day 3: 7 = 7
    Day 4: 8 = 8
    Day 5: 9 = 9
    Day 6: 10 = 10
    Total: 6 days > 5 days
  Doesn't work! Need larger: left = 13

Iteration 5: mid = (13 + 15) // 2 = 14
  Can ship with capacity 14?
    Total: 6 days > 5 days
  Doesn't work! Need larger: left = 15

left = right = 15, exit loop

Result: 15
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
