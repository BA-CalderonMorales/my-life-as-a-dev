---
comments: true
---

# Minimum Time to Complete Trips

**Difficulty**: Medium  
**LeetCode**: [#2187](https://leetcode.com/problems/minimum-time-to-complete-trips/)

## Problem Statement

You are given an array time where time[i] denotes the time taken by the i-th bus to complete one trip. Each bus can make multiple trips successively. You want to complete totalTrips trips. Return the minimum time required for all buses to complete at least totalTrips trips.

**Example**:
```
Input: time = [1, 2, 3], totalTrips = 5
Output: 3
Explanation: At time 3, trips: bus1=3, bus2=1, bus3=1, total=5
```

## Approach

Key observations:

- Minimum time: 1 (theoretical minimum)
- Maximum time: min(time) * totalTrips (slowest scenario)
- For any time t, we can calculate total trips possible
- If time t works, any time > t also works (monotonic)

Binary search for minimum time that allows totalTrips.

## Solution

```python
def minimum_time(time, total_trips):
    """
    Find minimum time to complete total_trips.
    
    Time Complexity: O(n * log(min(time) * total_trips))
    Space Complexity: O(1)
    """
    def trips_possible_in_time(t):
        """Calculate total trips all buses can make in time t."""
        trips = 0
        for bus_time in time:
            trips += t // bus_time
        return trips
    
    # Search space: [1, min_time * total_trips]
    left = 1
    right = min(time) * total_trips
    
    # Binary search for minimum time
    while left < right:
        mid = (left + right) // 2
        
        if trips_possible_in_time(mid) >= total_trips:
            # Can complete trips in this time, try less time
            right = mid
        else:
            # Can't complete trips, need more time
            left = mid + 1
    
    return left

# Test
time = [1, 2, 3]
total_trips = 5
print(minimum_time(time, total_trips))  # Output: 3
```

## Step-by-Step Walkthrough

```
time = [1, 2, 3], totalTrips = 5

Search space: [1, 5] (min(time) * totalTrips = 1 * 5)

Iteration 1: mid = (1 + 5) // 2 = 3
  Trips possible in time 3?
    Bus 1 (time=1): 3//1 = 3 trips
    Bus 2 (time=2): 3//2 = 1 trip
    Bus 3 (time=3): 3//3 = 1 trip
    Total: 5 trips >= 5
  Works! Try less time: right = 3

Iteration 2: mid = (1 + 3) // 2 = 2
  Trips possible in time 2?
    Bus 1 (time=1): 2//1 = 2 trips
    Bus 2 (time=2): 2//2 = 1 trip
    Bus 3 (time=3): 2//3 = 0 trips
    Total: 3 trips < 5
  Doesn't work! Need more time: left = 3

left = right = 3, exit loop

Result: 3
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
