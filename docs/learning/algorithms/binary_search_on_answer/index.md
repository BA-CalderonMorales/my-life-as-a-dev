# Binary Search on Answer Pattern

Binary Search on Answer is a technique where you use binary search not to find an element, but to find an optimal value (minimum or maximum) that satisfies certain conditions. It's particularly powerful for optimization problems.

## When to Use Binary Search on Answer

Use this pattern when:

- You need to find minimum or maximum value satisfying constraints
- Brute force would check every possible value (too slow)
- You can verify if a candidate answer works in reasonable time
- The search space has monotonic properties (if x works, values on one side also work)

## Core Approach

### The Process

1. **Identify Search Space**: Define minimum and maximum possible answers
2. **Define Feasibility Check**: Can we verify if a candidate answer works?
3. **Establish Monotonicity**: If answer x works, does x+1 (or x-1) also work?
4. **Binary Search**: Use binary search to find optimal value
5. **Return Result**: The boundary where feasibility changes

### Key Insight

Instead of searching for an element in an array, we're searching for a value in a range. We test middle values and eliminate half the search space based on whether that value satisfies our constraints.

## Problem 1: Capacity To Ship Packages Within D Days

**Difficulty**: Medium  
**LeetCode**: #1011

### Problem Statement

A conveyor belt has packages that must be shipped within D days. Each package has a weight, and you need to find the minimum ship capacity to ship all packages within D days. Packages must be shipped in order.

**Example**:
```
Input: weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5
Output: 15
Explanation: Ship with capacity 15 can ship all packages in 5 days
```

### Approach

Key observations:
- Minimum capacity: maximum single package weight (must fit largest)
- Maximum capacity: sum of all weights (ship everything in 1 day)
- For any capacity, we can check if it allows shipping in D days
- If capacity C works, any capacity > C also works (monotonic)

Binary search for the minimum capacity that works.

### Solution

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

### Step-by-Step Walkthrough

```
weights = [1,2,3,4,5,6,7,8,9,10], days = 5

Search space: [10 (max weight), 55 (sum of all)]

Iteration 1: mid = (10 + 55) // 2 = 32
  Can ship with capacity 32?
    Day 1: 1+2+3+4+5+6+7 = 28
    Day 2: 8+9+10 = 27
    Total: 2 days <= 5 days ✓
  Works! Try smaller: right = 32

Iteration 2: mid = (10 + 32) // 2 = 21
  Can ship with capacity 21?
    Day 1: 1+2+3+4+5+6 = 21
    Day 2: 7+8 = 15
    Day 3: 9+10 = 19
    Total: 3 days <= 5 days ✓
  Works! Try smaller: right = 21

Iteration 3: mid = (10 + 21) // 2 = 15
  Can ship with capacity 15?
    Day 1: 1+2+3+4+5 = 15
    Day 2: 6+7 = 13
    Day 3: 8 = 8
    Day 4: 9 = 9
    Day 5: 10 = 10
    Total: 5 days <= 5 days ✓
  Works! Try smaller: right = 15

Iteration 4: mid = (10 + 15) // 2 = 12
  Can ship with capacity 12?
    Day 1: 1+2+3+4 = 10
    Day 2: 5+6 = 11
    Day 3: 7 = 7
    Day 4: 8 = 8
    Day 5: 9 = 9
    Day 6: 10 = 10
    Total: 6 days > 5 days ✗
  Doesn't work! Need larger: left = 13

Iteration 5: mid = (13 + 15) // 2 = 14
  Can ship with capacity 14?
    Day 1: 1+2+3+4 = 10
    Day 2: 5+6 = 11
    Day 3: 7 = 7
    Day 4: 8 = 8
    Day 5: 9 = 9
    Day 6: 10 = 10
    Total: 6 days > 5 days ✗
  Doesn't work! Need larger: left = 15

left = right = 15, exit loop

Result: 15
```

## Problem 2: Koko Eating Bananas

**Difficulty**: Medium  
**LeetCode**: #875

### Problem Statement

Koko loves bananas. There are N piles of bananas, where pile i has piles[i] bananas. The guards will return in H hours. Koko can decide her eating speed k (bananas per hour). Each hour, she chooses a pile and eats k bananas. If the pile has fewer than k bananas, she eats them all and won't eat more that hour.

Find the minimum eating speed k so she can eat all bananas within H hours.

**Example**:
```
Input: piles = [3, 6, 7, 11], h = 8
Output: 4
Explanation: Speed 4 allows eating all bananas in 8 hours
```

### Approach

Key observations:
- Minimum speed: 1 banana/hour
- Maximum speed: max(piles) - eat any pile in 1 hour
- For any speed k, we can calculate hours needed
- If speed k works, any speed > k also works (monotonic)

Binary search for minimum speed that works.

### Solution

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

### Step-by-Step Walkthrough

```
piles = [3, 6, 7, 11], h = 8

Search space: [1, 11 (max pile)]

Iteration 1: mid = (1 + 11) // 2 = 6
  Can eat with speed 6?
    Pile 3: ceil(3/6) = 1 hour
    Pile 6: ceil(6/6) = 1 hour
    Pile 7: ceil(7/6) = 2 hours
    Pile 11: ceil(11/6) = 2 hours
    Total: 6 hours <= 8 hours ✓
  Works! Try slower: right = 6

Iteration 2: mid = (1 + 6) // 2 = 3
  Can eat with speed 3?
    Pile 3: ceil(3/3) = 1 hour
    Pile 6: ceil(6/3) = 2 hours
    Pile 7: ceil(7/3) = 3 hours
    Pile 11: ceil(11/3) = 4 hours
    Total: 10 hours > 8 hours ✗
  Doesn't work! Need faster: left = 4

Iteration 3: mid = (4 + 6) // 2 = 5
  Can eat with speed 5?
    Pile 3: ceil(3/5) = 1 hour
    Pile 6: ceil(6/5) = 2 hours
    Pile 7: ceil(7/5) = 2 hours
    Pile 11: ceil(11/5) = 3 hours
    Total: 8 hours <= 8 hours ✓
  Works! Try slower: right = 5

Iteration 4: mid = (4 + 5) // 2 = 4
  Can eat with speed 4?
    Pile 3: ceil(3/4) = 1 hour
    Pile 6: ceil(6/4) = 2 hours
    Pile 7: ceil(7/4) = 2 hours
    Pile 11: ceil(11/4) = 3 hours
    Total: 8 hours <= 8 hours ✓
  Works! Try slower: right = 4

left = right = 4, exit loop

Result: 4
```

## Problem 3: Minimum Time to Complete Trips

**Difficulty**: Medium  
**LeetCode**: #2187

### Problem Statement

You are given an array time where time[i] denotes the time taken by the i-th bus to complete one trip. Each bus can make multiple trips successively. You want to complete totalTrips trips. Return the minimum time required for all buses to complete at least totalTrips trips.

**Example**:
```
Input: time = [1, 2, 3], totalTrips = 5
Output: 3
Explanation: At time 3, trips: bus1=3, bus2=1, bus3=1, total=5
```

### Approach

Key observations:
- Minimum time: 1 (theoretical minimum)
- Maximum time: min(time) * totalTrips (slowest scenario)
- For any time t, we can calculate total trips possible
- If time t works, any time > t also works (monotonic)

Binary search for minimum time that allows totalTrips.

### Solution

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

### Step-by-Step Walkthrough

```
time = [1, 2, 3], totalTrips = 5

Search space: [1, 5] (min(time) * totalTrips = 1 * 5)

Iteration 1: mid = (1 + 5) // 2 = 3
  Trips possible in time 3?
    Bus 1 (time=1): 3//1 = 3 trips
    Bus 2 (time=2): 3//2 = 1 trip
    Bus 3 (time=3): 3//3 = 1 trip
    Total: 5 trips >= 5 ✓
  Works! Try less time: right = 3

Iteration 2: mid = (1 + 3) // 2 = 2
  Trips possible in time 2?
    Bus 1 (time=1): 2//1 = 2 trips
    Bus 2 (time=2): 2//2 = 1 trip
    Bus 3 (time=3): 2//3 = 0 trips
    Total: 3 trips < 5 ✗
  Doesn't work! Need more time: left = 3

left = right = 3, exit loop

Result: 3
```

## Key Takeaways

1. **Transform Problem**: Convert optimization to decision problem ("can we do it with value x?")
2. **Find Monotonicity**: Ensure search space has clear direction
3. **Efficient Validation**: Feasibility check must be reasonable (usually O(n))
4. **Mind the Boundaries**: Be careful with left/right updates to avoid infinite loops
5. **Integer vs Float**: Handle precision appropriately for continuous spaces

## Template Pattern

```python
def binary_search_answer(problem_params):
    def is_feasible(candidate):
        """Check if candidate value satisfies constraints."""
        # Problem-specific validation logic
        pass
    
    # Define search space
    left = minimum_possible_value
    right = maximum_possible_value
    
    # Binary search
    while left < right:
        mid = (left + right) // 2
        
        if is_feasible(mid):
            # mid works, search for better (smaller/larger)
            right = mid  # for minimum
            # left = mid + 1  # for maximum
        else:
            # mid doesn't work
            left = mid + 1  # for minimum
            # right = mid  # for maximum
    
    return left
```

## Common Applications

- Capacity/resource allocation problems
- Scheduling and time optimization
- Finding thresholds or limits
- Minimizing maximum or maximizing minimum
- Problems with "at least" or "at most" constraints

## Practice Tips

- Draw a timeline or diagram of the search space
- Test your feasibility function independently
- Verify monotonicity property holds
- Consider edge cases (empty input, single element)
- Think about integer overflow for large search spaces

## Common Pitfalls

- Forgetting to handle edge cases in feasibility check
- Off-by-one errors in boundary updates
- Not considering integer division behavior
- Infinite loops from incorrect boundary updates
- Wrong initial search space boundaries
