# Daily Temperatures

**Difficulty**: Medium  
**LeetCode**: [#739](https://leetcode.com/problems/daily-temperatures/)

## Problem Statement

Given an array of daily temperatures, return an array where each element tells you how many days until a warmer temperature. If no warmer day exists, use 0.

**Example**:
```
Input: temperatures = [73, 74, 75, 71, 69, 72, 76, 73]
Output: [1, 1, 4, 2, 1, 1, 0, 0]
Explanation: Day 0: next warmer is day 1 (1 day later)
             Day 2: next warmer is day 6 (4 days later)
```

## Approach

Use monotonically decreasing stack:

- Stack stores indices of temperatures
- When we find warmer temperature, pop all cooler days
- Distance between indices gives days to wait

Maintain decreasing order: only pop when warmer found.

## Solution

```python
def daily_temperatures(temperatures):
    """
    Find days until warmer temperature using monotonic stack.
    
    Time Complexity: O(n) - each element pushed and popped at most once
    Space Complexity: O(n) - stack can hold all elements
    """
    n = len(temperatures)
    answer = [0] * n
    stack = []  # Store indices
    
    for i in range(n):
        # Pop all cooler days
        while stack and temperatures[i] > temperatures[stack[-1]]:
            prev_day = stack.pop()
            answer[prev_day] = i - prev_day
        
        # Add current day
        stack.append(i)
    
    return answer

# Test
temperatures = [73, 74, 75, 71, 69, 72, 76, 73]
print(daily_temperatures(temperatures))
# Output: [1, 1, 4, 2, 1, 1, 0, 0]
```

## Step-by-Step Walkthrough

```
temperatures = [73, 74, 75, 71, 69, 72, 76, 73]

i=0, temp=73:
  stack empty, push 0
  stack = [0]
  answer = [0, 0, 0, 0, 0, 0, 0, 0]

i=1, temp=74:
  74 > 73 (stack[0]), pop 0
  answer[0] = 1 - 0 = 1
  push 1
  stack = [1]
  answer = [1, 0, 0, 0, 0, 0, 0, 0]

i=2, temp=75:
  75 > 74 (stack[1]), pop 1
  answer[1] = 2 - 1 = 1
  push 2
  stack = [2]
  answer = [1, 1, 0, 0, 0, 0, 0, 0]

i=3, temp=71:
  71 < 75, no pop
  push 3
  stack = [2, 3]
  answer = [1, 1, 0, 0, 0, 0, 0, 0]

i=4, temp=69:
  69 < 71, no pop
  push 4
  stack = [2, 3, 4]
  answer = [1, 1, 0, 0, 0, 0, 0, 0]

i=5, temp=72:
  72 > 69 (stack[4]), pop 4
  answer[4] = 5 - 4 = 1
  72 > 71 (stack[3]), pop 3
  answer[3] = 5 - 3 = 2
  72 < 75, no more pops
  push 5
  stack = [2, 5]
  answer = [1, 1, 0, 2, 1, 0, 0, 0]

i=6, temp=76:
  76 > 72 (stack[5]), pop 5
  answer[5] = 6 - 5 = 1
  76 > 75 (stack[2]), pop 2
  answer[2] = 6 - 2 = 4
  push 6
  stack = [6]
  answer = [1, 1, 4, 2, 1, 1, 0, 0]

i=7, temp=73:
  73 < 76, no pop
  push 7
  stack = [6, 7]
  answer = [1, 1, 4, 2, 1, 1, 0, 0]

Final: indices 6, 7 remain in stack (no warmer day)
Result: [1, 1, 4, 2, 1, 1, 0, 0]
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
