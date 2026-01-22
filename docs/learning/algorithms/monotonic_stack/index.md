---
tags:
  - Algorithms
  - Interview
  - Data Structures
---

# Monotonic Stack Pattern

A monotonic stack is a stack that maintains elements in a monotonically increasing or decreasing order. This pattern is powerful for solving problems that require finding the next greater or smaller element, or problems involving ranges with specific ordering properties.

## When to Use Monotonic Stack

Use this pattern when:


- Finding next greater or smaller element
- Finding previous greater or smaller element
- Calculating spans or ranges based on comparisons
- Histogram problems or area calculations
- Problems involving temperature, stock prices, or similar sequences
- Building expressions with precedence constraints

## Core Approach

### Monotonic Stack Types

**Monotonically Increasing Stack**: Elements increase from bottom to top

- Pop smaller elements when adding larger
- Helps find next smaller element

**Monotonically Decreasing Stack**: Elements decrease from bottom to top

- Pop larger elements when adding smaller
- Helps find next greater element

### Key Pattern

```python
stack = []
for i, num in enumerate(arr):
    while stack and condition(stack[-1], num):
        # Found relationship for stack[-1]
        process(stack.pop())
    stack.append(i)  # or (i, num)
```

## Problem 1: Daily Temperatures

**Difficulty**: Medium  
**LeetCode**: #739

### Problem Statement

Given an array of daily temperatures, return an array where each element tells you how many days until a warmer temperature. If no warmer day exists, use 0.

**Example**:
```
Input: temperatures = [73, 74, 75, 71, 69, 72, 76, 73]
Output: [1, 1, 4, 2, 1, 1, 0, 0]
Explanation: Day 0: next warmer is day 1 (1 day later)
             Day 2: next warmer is day 6 (4 days later)
```

### Approach

Use monotonically decreasing stack:

- Stack stores indices of temperatures
- When we find warmer temperature, pop all cooler days
- Distance between indices gives days to wait

Maintain decreasing order: only pop when warmer found.

### Solution

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

### Step-by-Step Walkthrough

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

## Problem 2: Largest Rectangle in Histogram

**Difficulty**: Hard  
**LeetCode**: #84

### Problem Statement

Given heights of bars in a histogram, find the area of the largest rectangle that can be formed.

**Example**:
```
Input: heights = [2, 1, 5, 6, 2, 3]
Output: 10
Explanation: Rectangle of height 5 and width 2 (positions 2-3)
```

### Approach

Use monotonically increasing stack:

- Stack stores indices of bars
- When shorter bar found, calculate rectangles for taller bars
- Width extends from current position back to previous bar in stack
- Add sentinel 0 at end to process remaining bars

For each bar popped, its height is the rectangle height, and width is determined by boundaries.

### Solution

```python
def largest_rectangle_area(heights):
    """
    Find largest rectangle area using monotonic stack.
    
    Time Complexity: O(n) - each bar pushed and popped once
    Space Complexity: O(n) - stack
    """
    stack = []
    max_area = 0
    heights.append(0)  # Sentinel to flush remaining bars
    
    for i, h in enumerate(heights):
        # Pop all taller bars
        while stack and heights[stack[-1]] > h:
            height_idx = stack.pop()
            height = heights[height_idx]
            
            # Width from current position back to previous bar in stack
            width = i if not stack else i - stack[-1] - 1
            
            max_area = max(max_area, height * width)
        
        stack.append(i)
    
    heights.pop()  # Remove sentinel
    return max_area

# Test
heights = [2, 1, 5, 6, 2, 3]
print(largest_rectangle_area(heights))  # Output: 10
```

### Step-by-Step Walkthrough

```
heights = [2, 1, 5, 6, 2, 3] → append 0 → [2, 1, 5, 6, 2, 3, 0]

i=0, h=2:
  stack empty, push 0
  stack = [0]

i=1, h=1:
  1 < 2, pop 0
  height = 2, width = 1 (no prev in stack)
  area = 2 * 1 = 2, max = 2
  push 1
  stack = [1]

i=2, h=5:
  5 > 1, push 2
  stack = [1, 2]

i=3, h=6:
  6 > 5, push 3
  stack = [1, 2, 3]

i=4, h=2:
  2 < 6, pop 3
  height = 6, width = 4 - 2 - 1 = 1
  area = 6 * 1 = 6, max = 6
  
  2 < 5, pop 2
  height = 5, width = 4 - 1 - 1 = 2
  area = 5 * 2 = 10, max = 10
  
  2 > 1, no more pops
  push 4
  stack = [1, 4]

i=5, h=3:
  3 > 2, push 5
  stack = [1, 4, 5]

i=6, h=0 (sentinel):
  0 < 3, pop 5
  height = 3, width = 6 - 4 - 1 = 1
  area = 3 * 1 = 3, max = 10
  
  0 < 2, pop 4
  height = 2, width = 6 - 1 - 1 = 4
  area = 2 * 4 = 8, max = 10
  
  0 < 1, pop 1
  height = 1, width = 6 (no prev in stack)
  area = 1 * 6 = 6, max = 10
  
  push 6
  stack = [6]

Result: 10 (rectangle of height 5, width 2 at indices 2-3)
```

## Problem 3: Next Greater Element I

**Difficulty**: Easy  
**LeetCode**: #496

### Problem Statement

Given two arrays nums1 and nums2 where nums1 is a subset of nums2, find the next greater element for each element in nums1 within nums2.

**Example**:
```
Input: nums1 = [4, 1, 2], nums2 = [1, 3, 4, 2]
Output: [-1, 3, 3]
Explanation: 
  4: no greater element → -1
  1: next greater is 3
  2: no greater element → -1 (but actually 4 comes before)
  
Actually: nums2 = [1, 3, 4, 2]
  4: next greater = -1
  1: next greater = 3
  2: next greater = -1
```

### Approach

Use monotonic decreasing stack on nums2:
1. Build map of next greater elements for all nums2 elements
2. Use stack to efficiently find next greater
3. Look up results for nums1 elements in map

Process nums2 from right to left or use stack from left.

### Solution

```python
def next_greater_element(nums1, nums2):
    """
    Find next greater element for each nums1 element in nums2.
    
    Time Complexity: O(n + m) - process nums2 + lookup nums1
    Space Complexity: O(n) - stack and map for nums2
    """
    # Build next greater map for nums2
    next_greater = {}
    stack = []
    
    # Process from right to left
    for num in reversed(nums2):
        # Pop smaller or equal elements
        while stack and stack[-1] <= num:
            stack.pop()
        
        # Top of stack is next greater
        next_greater[num] = stack[-1] if stack else -1
        
        stack.append(num)
    
    # Look up results for nums1
    return [next_greater[num] for num in nums1]

# Alternative: Process left to right
def next_greater_element_alt(nums1, nums2):
    """Process nums2 left to right."""
    next_greater = {}
    stack = []
    
    for num in nums2:
        # Pop all smaller elements - found their next greater
        while stack and stack[-1] < num:
            next_greater[stack.pop()] = num
        stack.append(num)
    
    # Remaining elements have no next greater
    for num in stack:
        next_greater[num] = -1
    
    return [next_greater[num] for num in nums1]

# Test
nums1 = [4, 1, 2]
nums2 = [1, 3, 4, 2]
print(next_greater_element(nums1, nums2))  # Output: [-1, 3, -1]
```

### Step-by-Step Walkthrough

```
nums1 = [4, 1, 2], nums2 = [1, 3, 4, 2]

Right to left processing:

num = 2:
  stack = []
  next_greater[2] = -1
  stack = [2]

num = 4:
  4 > 2, pop 2
  stack = []
  next_greater[4] = -1
  stack = [4]

num = 3:
  3 < 4, don't pop
  next_greater[3] = 4
  stack = [4, 3]

num = 1:
  1 < 3, don't pop
  next_greater[1] = 3
  stack = [4, 3, 1]

Map: {2: -1, 4: -1, 3: 4, 1: 3}

Look up nums1:
  nums1[0] = 4 → next_greater[4] = -1
  nums1[1] = 1 → next_greater[1] = 3
  nums1[2] = 2 → next_greater[2] = -1

Result: [-1, 3, -1]

Left to right alternative:

num = 1:
  stack = []
  push 1
  stack = [1]

num = 3:
  3 > 1, pop 1
  next_greater[1] = 3
  push 3
  stack = [3]

num = 4:
  4 > 3, pop 3
  next_greater[3] = 4
  push 4
  stack = [4]

num = 2:
  2 < 4, no pop
  push 2
  stack = [4, 2]

Remaining in stack: no next greater
  next_greater[4] = -1
  next_greater[2] = -1

Same result: [-1, 3, -1]
```

## Key Takeaways

1. **Stack Direction**: Increasing for "previous smaller", decreasing for "next greater"
2. **Processing Order**: Left to right or right to left depending on problem
3. **What to Store**: Indices vs values - indices often more useful
4. **Boundary Handling**: Sentinels can simplify code
5. **O(n) Guarantee**: Each element pushed and popped at most once

## Common Applications

### Next/Previous Greater
- Next greater element
- Next greater frequency
- Stock span problem
- Maximum in sliding window

### Area/Range Problems
- Largest rectangle in histogram
- Maximal rectangle in matrix
- Trapping rain water
- Container with most water

### Expression Evaluation
- Valid parentheses
- Remove duplicate letters
- Decode string
- Basic calculator

## Practice Tips

- Draw the stack state at each step
- Understand what condition triggers pop
- Decide: store indices or values?
- Consider processing direction (left or right)
- Think about what stack elements represent
- Use sentinels to avoid edge case handling

## Template Pattern

```python
# Template for next greater element
def next_greater_template(arr):
    """Find next greater element for each position."""
    result = [-1] * len(arr)
    stack = []  # Store indices
    
    for i in range(len(arr)):
        # Pop all smaller elements - found their next greater
        while stack and arr[stack[-1]] < arr[i]:
            prev_idx = stack.pop()
            result[prev_idx] = arr[i]
        
        stack.append(i)
    
    return result

# Template for previous smaller element
def prev_smaller_template(arr):
    """Find previous smaller element for each position."""
    result = [-1] * len(arr)
    stack = []  # Store indices, maintain increasing
    
    for i in range(len(arr)):
        # Pop all greater or equal elements
        while stack and arr[stack[-1]] >= arr[i]:
            stack.pop()
        
        # Top of stack is previous smaller
        if stack:
            result[i] = arr[stack[-1]]
        
        stack.append(i)
    
    return result
```

## Common Mistakes

- Wrong monotonic direction (increasing vs decreasing)
- Storing values when indices are needed
- Not handling empty stack correctly
- Wrong inequality in pop condition
- Processing in wrong direction for the problem
- Forgetting to add current element after popping
- Not initializing result array with correct default values

## Practice on LeetCode

- [739. Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)
- [84. Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/)
- [496. Next Greater Element I](https://leetcode.com/problems/next-greater-element-i/)
