---
tags:
  - Algorithms
  - Interview
  - Python
---

# Greedy Algorithms Pattern

Greedy algorithms make locally optimal choices at each step with the hope of finding a global optimum. They build solutions piece by piece, always choosing the next piece that offers the most immediate benefit.

## When to Use Greedy Algorithms

Use this pattern when:


- Problem has optimal substructure
- Greedy choice property holds (local optimum leads to global optimum)
- Activity selection or scheduling problems
- Minimum spanning tree problems
- Huffman coding or compression
- Fractional knapsack (not 0/1 knapsack)
- Problems involving intervals, meetings, or events

## Core Approach

### Greedy Choice Property

A greedy algorithm must satisfy:
1. **Greedy Choice**: Local optimum contributes to global optimum
2. **Optimal Substructure**: Optimal solution contains optimal subsolutions

### Key Steps

1. **Sort**: Often requires sorting by some criterion
2. **Select**: Pick the locally best option
3. **Validate**: Check if choice is feasible
4. **Repeat**: Continue until solution complete

### Greedy vs Dynamic Programming

- **Use Greedy when**

    - Local optimum always leads to global
    - No overlapping subproblems to store
    - Typically O(n log n) due to sorting

- **Use DP when**

    - Need to consider all possibilities
    - Overlapping subproblems exist
    - Greedy doesn't guarantee optimality

## Problem 1: Jump Game

**Difficulty**: Medium  
**LeetCode**: #55

### Problem Statement

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

### Approach

Greedy approach: Track maximum reachable index

- Start from position 0
- At each position, update farthest reachable index
- If current position exceeds farthest, can't proceed
- If farthest reaches last index, return true

Always choosing maximum reach ensures we explore all possibilities.

### Solution

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

### Step-by-Step Walkthrough

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

## Problem 2: Meeting Rooms II

**Difficulty**: Medium  
**LeetCode**: #253

### Problem Statement

Given an array of meeting time intervals, find the minimum number of conference rooms required.

**Example**:
```
Input: intervals = [[0,30],[5,10],[15,20]]
Output: 2
Explanation: Meetings [5,10] and [15,20] overlap with [0,30]

Input: intervals = [[7,10],[2,4]]
Output: 1
```

### Approach

Greedy with separate start and end times:
1. Separate start times and end times, sort both
2. Track rooms needed as we process times
3. When meeting starts, need room (increment)
4. When meeting ends, room freed (decrement)
5. Track maximum rooms needed simultaneously

This works because we only care about overlap count, not which specific meetings.

### Solution

```python
def min_meeting_rooms(intervals):
    """
    Find minimum conference rooms needed.
    
    Time Complexity: O(n log n) - sorting
    Space Complexity: O(n) - separate arrays
    """
    if not intervals:
        return 0
    
    # Separate start and end times
    starts = sorted([i[0] for i in intervals])
    ends = sorted([i[1] for i in intervals])
    
    rooms = 0
    max_rooms = 0
    start_ptr = 0
    end_ptr = 0
    
    # Process all events
    while start_ptr < len(intervals):
        # Meeting starting
        if starts[start_ptr] < ends[end_ptr]:
            rooms += 1
            max_rooms = max(max_rooms, rooms)
            start_ptr += 1
        # Meeting ending
        else:
            rooms -= 1
            end_ptr += 1
    
    return max_rooms

# Alternative: Using heap
import heapq

def min_meeting_rooms_heap(intervals):
    """Alternative using min heap."""
    if not intervals:
        return 0
    
    # Sort by start time
    intervals.sort(key=lambda x: x[0])
    
    # Heap stores end times of ongoing meetings
    heap = []
    
    for start, end in intervals:
        # Remove ended meetings
        if heap and heap[0] <= start:
            heapq.heappop(heap)
        
        # Add current meeting
        heapq.heappush(heap, end)
    
    # Heap size is max concurrent meetings
    return len(heap)

# Test
intervals = [[0,30],[5,10],[15,20]]
print(min_meeting_rooms(intervals))  # Output: 2
```

### Step-by-Step Walkthrough

```
intervals = [[0,30],[5,10],[15,20]]

Sort separately:
  starts = [0, 5, 15]
  ends   = [10, 20, 30]

Process timeline:
Time 0: meeting starts
  rooms = 1, max = 1
  start_ptr = 1, end_ptr = 0

Time 5: meeting starts (before any ends at 10)
  rooms = 2, max = 2
  start_ptr = 2, end_ptr = 0

Time 10: meeting ends (10 == ends[0])
  Can't process yet (15 < 10 is false)
  
Time 15: meeting starts (after 10 ends)
  15 >= 10, so meeting ended first
  rooms = 1
  end_ptr = 1
  Then meeting starts:
  rooms = 2, max = 2
  start_ptr = 3

Done processing starts
  
Result: 2 rooms needed

Heap alternative:
  Sort: [[0,30],[5,10],[15,20]]
  
  Process [0,30]:
    heap = [30]
    size = 1
  
  Process [5,10]:
    5 < 30, can't remove
    heap = [10, 30]
    size = 2
  
  Process [15,20]:
    15 > 10, remove 10
    heap = [30]
    Add 20: heap = [20, 30]
    size = 2
  
  Result: 2
```

## Problem 3: Partition Labels

**Difficulty**: Medium  
**LeetCode**: #763

### Problem Statement

Given a string, partition it into as many parts as possible so that each letter appears in at most one part. Return the sizes of the partitions.

**Example**:
```
Input: s = "ababcbacadefegdehijhklij"
Output: [9,7,8]
Explanation: "ababcbaca", "defegde", "hijhklij"
```

### Approach

Greedy with last occurrence tracking:
1. Record last occurrence of each character
2. Track current partition's end (farthest last occurrence)
3. When reaching current partition end, create partition
4. Extend partition end if later character appears earlier

Greedy works because we always extend to include all occurrences.

### Solution

```python
def partition_labels(s):
    """
    Partition string into maximum parts.
    
    Time Complexity: O(n) - two passes
    Space Complexity: O(1) - at most 26 characters
    """
    # Record last occurrence of each character
    last = {char: i for i, char in enumerate(s)}
    
    partitions = []
    start = 0
    end = 0
    
    for i, char in enumerate(s):
        # Extend partition to include this character's last occurrence
        end = max(end, last[char])
        
        # Reached end of current partition
        if i == end:
            partitions.append(end - start + 1)
            start = i + 1
    
    return partitions

# Test
s = "ababcbacadefegdehijhklij"
print(partition_labels(s))  # Output: [9, 7, 8]
```

### Step-by-Step Walkthrough

```
s = "ababcbacadefegdehijhklij"

Build last occurrence map:
  a: 8, b: 5, c: 7, d: 14, e: 15, f: 11, 
  g: 13, h: 19, i: 22, j: 23, k: 20, l: 21

Process characters:

i=0, char='a':
  end = max(0, last['a']=8) = 8
  Not at end yet

i=1, char='b':
  end = max(8, last['b']=5) = 8
  Not at end yet

i=2, char='a':
  end = max(8, last['a']=8) = 8
  Not at end yet

...

i=5, char='b':
  end = max(8, last['b']=5) = 8
  Not at end yet

i=7, char='c':
  end = max(8, last['c']=7) = 8
  Not at end yet

i=8, char='a':
  end = max(8, last['a']=8) = 8
  i == end! Create partition
  size = 8 - 0 + 1 = 9
  partitions = [9]
  start = 9

i=9, char='d':
  end = max(8, last['d']=14) = 14
  
i=10, char='e':
  end = max(14, last['e']=15) = 15

...

i=15, char='e':
  end = max(15, last['e']=15) = 15
  i == end! Create partition
  size = 15 - 9 + 1 = 7
  partitions = [9, 7]
  start = 16

i=16, char='h':
  end = max(15, last['h']=19) = 19

...

i=23, char='j':
  end = max(23, last['j']=23) = 23
  i == end! Create partition
  size = 23 - 16 + 1 = 8
  partitions = [9, 7, 8]

Result: [9, 7, 8]
```

## Key Takeaways

1. **Proof Required**: Greedy needs proof that local optimum leads to global
2. **Sorting Common**: Many greedy problems start with sorting
3. **Simple Implementation**: Usually simpler than DP alternatives
4. **Not Always Optimal**: Greedy fails on some problems (0/1 knapsack)
5. **Fast Execution**: Typically O(n log n) or better

## Common Greedy Patterns

### Interval Problems
- Activity selection
- Meeting rooms
- Non-overlapping intervals
- Merge intervals

### Optimization Problems
- Huffman coding
- Fractional knapsack
- Job scheduling
- Minimum coins (specific denominations)

### Sequence Problems
- Jump game
- Gas station
- Candy distribution
- Partition problems

## Practice Tips

- Try greedy first for optimization problems
- Prove correctness with exchange argument or induction
- Sort data appropriately before making greedy choices
- Consider whether all cases are covered
- If greedy fails, switch to DP or backtracking
- Draw timeline or diagram to visualize choices

## Template Pattern

```python
def greedy_template(items):
    """General greedy algorithm template."""
    # Step 1: Sort by some criterion
    items.sort(key=lambda x: greedy_criterion(x))
    
    result = initial_value
    
    # Step 2: Make greedy choices
    for item in items:
        # Step 3: Check if choice is feasible
        if is_feasible(item, result):
            # Step 4: Update result with greedy choice
            result = make_choice(item, result)
    
    return result

# Interval scheduling template
def interval_template(intervals):
    """Template for interval problems."""
    # Sort by end time (or start time depending on problem)
    intervals.sort(key=lambda x: x[1])
    
    count = 0
    last_end = float('-inf')
    
    for start, end in intervals:
        if start >= last_end:  # No overlap
            count += 1
            last_end = end
    
    return count
```

## Common Mistakes

- Assuming greedy works without proof
- Wrong sorting criterion
- Not considering edge cases
- Missing feasibility check
- Using greedy when DP is needed
- Incorrect greedy choice definition
- Not handling empty input

## Practice on LeetCode

- [55. Jump Game](https://leetcode.com/problems/jump-game/)
- [45. Jump Game II](https://leetcode.com/problems/jump-game-ii/)
- [406. Queue Reconstruction by Height](https://leetcode.com/problems/queue-reconstruction-by-height/)
