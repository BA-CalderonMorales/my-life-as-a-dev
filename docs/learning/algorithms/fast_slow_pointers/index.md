# Fast and Slow Pointers Pattern

The Fast and Slow Pointers pattern, also known as the Floyd's Cycle Detection algorithm or the Tortoise and Hare algorithm, uses two pointers moving at different speeds through a data structure. This technique is particularly effective for cycle detection and finding middle elements.

## When to Use Fast and Slow Pointers

Use this pattern when:

- Detecting cycles in linked lists or sequences
- Finding the middle of a linked list
- Determining if a structure is a palindrome
- Finding the start of a cycle
- Problems involving circular or cyclic data

## Core Approach

### The Concept

- **Slow Pointer**: Moves one step at a time
- **Fast Pointer**: Moves two steps at a time (or some other ratio)

**Key Insight**: If there's a cycle, fast pointer will eventually catch up to slow pointer. If no cycle, fast pointer reaches end.

### Why It Works for Cycle Detection

In a cycle:
- Fast pointer enters cycle first
- Eventually both pointers are in cycle
- Fast pointer gains on slow pointer by 1 position per iteration
- They must meet (can't skip over each other)

## Problem 1: Linked List Cycle

**Difficulty**: Easy  
**LeetCode**: #141

### Problem Statement

Given head of a linked list, determine if the list has a cycle in it.

**Example**:
```
Input: head = [3,2,0,-4], pos = 1 (cycle at position 1)
Output: true
```

### Approach

Use two pointers:
- Slow moves one step per iteration
- Fast moves two steps per iteration
- If they meet, there's a cycle
- If fast reaches end (None), no cycle

### Solution

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def has_cycle(head):
    """
    Detect if linked list has a cycle.
    
    Time Complexity: O(n) - visit each node at most once
    Space Complexity: O(1) - only two pointers
    """
    if not head or not head.next:
        return False
    
    slow = head
    fast = head
    
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        
        if slow == fast:
            return True  # Cycle detected
    
    return False  # Reached end, no cycle

# Test helper to create cycle
def create_cycle_list(values, pos):
    """Create linked list with cycle at position pos (-1 for no cycle)."""
    if not values:
        return None
    
    head = ListNode(values[0])
    current = head
    cycle_node = None
    
    if pos == 0:
        cycle_node = head
    
    for i in range(1, len(values)):
        current.next = ListNode(values[i])
        current = current.next
        if i == pos:
            cycle_node = current
    
    if cycle_node:
        current.next = cycle_node
    
    return head

# Test
head = create_cycle_list([3, 2, 0, -4], 1)
print(has_cycle(head))  # Output: True
```

### Step-by-Step Walkthrough

```
List: 3 -> 2 -> 0 -> -4 -> (back to 2)

Initial: slow = 3, fast = 3

Iteration 1:
  slow = slow.next = 2
  fast = fast.next.next = 0
  slow != fast, continue

Iteration 2:
  slow = slow.next = 0
  fast = fast.next.next = 2
  slow != fast, continue

Iteration 3:
  slow = slow.next = -4
  fast = fast.next.next = -4
  slow == fast ✓ Cycle detected!

Result: True
```

## Problem 2: Middle of the Linked List

**Difficulty**: Easy  
**LeetCode**: #876

### Problem Statement

Given a linked list, return the middle node. If there are two middle nodes, return the second one.

**Example**:
```
Input: head = [1,2,3,4,5]
Output: [3,4,5] (node with value 3)
```

### Approach

Use two pointers:
- When fast pointer reaches end, slow pointer is at middle
- Fast moves 2x speed, so slow is at halfway point when fast finishes

### Solution

```python
def middle_node(head):
    """
    Find middle node of linked list.
    
    Time Complexity: O(n) - traverse list once
    Space Complexity: O(1) - only two pointers
    """
    if not head:
        return None
    
    slow = head
    fast = head
    
    # When fast reaches end, slow is at middle
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    
    return slow

# Test helper
def create_list(values):
    """Create linked list from values."""
    if not values:
        return None
    head = ListNode(values[0])
    current = head
    for val in values[1:]:
        current.next = ListNode(val)
        current = current.next
    return head

def list_to_array(head):
    """Convert linked list to array."""
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result

# Test
head = create_list([1, 2, 3, 4, 5])
middle = middle_node(head)
print(list_to_array(middle))  # Output: [3, 4, 5]
```

### Step-by-Step Walkthrough

```
List: 1 -> 2 -> 3 -> 4 -> 5 -> None

Initial: slow = 1, fast = 1

Iteration 1:
  slow = slow.next = 2
  fast = fast.next.next = 3
  fast and fast.next exist, continue

Iteration 2:
  slow = slow.next = 3
  fast = fast.next.next = 5
  fast and fast.next exist, continue

Iteration 3:
  slow = slow.next = 4
  fast = fast.next.next = None
  fast is None, exit loop

Result: slow points to 3 (middle node)
```

## Problem 3: Linked List Cycle II

**Difficulty**: Medium  
**LeetCode**: #142

### Problem Statement

Given a linked list, return the node where the cycle begins. If no cycle, return null.

**Example**:
```
Input: head = [3,2,0,-4], pos = 1
Output: Node with value 2 (cycle starts here)
```

### Approach

Two-phase algorithm:

**Phase 1**: Detect cycle (same as Problem 1)
- If no cycle, return None

**Phase 2**: Find cycle start
- Reset one pointer to head
- Move both pointers one step at a time
- Where they meet is the cycle start

**Why this works**: Mathematical proof based on distances traveled.

### Solution

```python
def detect_cycle(head):
    """
    Find the node where cycle begins.
    
    Time Complexity: O(n) - two passes through list
    Space Complexity: O(1) - only two pointers
    """
    if not head or not head.next:
        return None
    
    # Phase 1: Detect if cycle exists
    slow = head
    fast = head
    has_cycle_flag = False
    
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        
        if slow == fast:
            has_cycle_flag = True
            break
    
    if not has_cycle_flag:
        return None
    
    # Phase 2: Find cycle start
    # Reset slow to head, move both one step at a time
    slow = head
    
    while slow != fast:
        slow = slow.next
        fast = fast.next
    
    return slow  # This is the cycle start

# Test
head = create_cycle_list([3, 2, 0, -4], 1)
cycle_start = detect_cycle(head)
print(cycle_start.val if cycle_start else None)  # Output: 2
```

### Step-by-Step Walkthrough

```
List: 3 -> 2 -> 0 -> -4 -> (back to 2)

Phase 1: Detect cycle
  slow = 3, fast = 3
  slow = 2, fast = 0
  slow = 0, fast = 2
  slow = -4, fast = -4
  Cycle detected at node -4

Phase 2: Find start
  Reset slow to head (3)
  fast stays at -4
  
  Both move one step:
    slow = 2, fast = 2
    They meet at node 2!

Result: Node with value 2 (cycle start)

Why it works:
- Let's say distance from head to cycle start is 'a'
- Distance from cycle start to meeting point is 'b'
- Cycle length is 'c'
- When they meet: slow traveled a+b, fast traveled a+b+c
- Since fast is 2x speed: 2(a+b) = a+b+c
- Simplifies to: a = c-b
- So moving from head 'a' steps and from meeting point 'a' steps
  both lead to cycle start!
```

## Key Takeaways

1. **Speed Ratio**: Typically 2:1, but can vary based on problem
2. **Cycle Detection**: Fast and slow pointers guaranteed to meet in cycle
3. **Middle Finding**: Fast reaches end when slow at middle
4. **Space Efficiency**: O(1) space vs O(n) for hash set approach
5. **Multiple Phases**: Some problems require cycle detection followed by additional work

## Common Patterns

### Cycle Detection
- Linked list cycle (I and II)
- Happy number problem
- Circular array loop

### Middle Finding
- Middle of linked list
- Palindrome linked list (find middle, then reverse)
- Reorder linked list

### Other Applications
- Find nth node from end (fast pointer n steps ahead)
- Intersection of two linked lists
- Remove nth node from end

## Practice Tips

- Draw the list and trace pointer movements
- Understand the math behind cycle detection
- Consider edge cases: no cycle, single node, two nodes
- Practice both phases of cycle detection
- Think about why fast pointer moves 2 steps (not 3, 4, etc.)

## Template Pattern

```python
def fast_slow_pattern(head):
    """General template for fast/slow pointer problems."""
    if not head:
        return None
    
    slow = head
    fast = head
    
    # Move pointers at different speeds
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        
        # Check condition (cycle, middle, etc.)
        if slow == fast:
            # Found what we're looking for
            break
    
    # Post-processing if needed
    # (e.g., find cycle start, reverse second half)
    
    return result
```

## Common Mistakes

- Not checking if fast.next exists before moving fast
- Initializing pointers at wrong positions
- Forgetting to handle empty list or single node
- Wrong movement ratio (e.g., moving slow by 2, fast by 3)
- Not handling case when no cycle exists

## External Resources

For additional learning on linked list algorithms and fast/slow pointer techniques:

- [From Traversal to Reversal: Essential Linked List Algorithms and Techniques](https://lnkd.in/eYruabNt) - Comprehensive guide covering linked list fundamentals, common interview problems, and advanced manipulation techniques. Perfect for mastering linked list operations and pointer management.
