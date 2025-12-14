# Linked List Cycle

**Difficulty**: Easy  
**LeetCode**: [#141](https://leetcode.com/problems/linked-list-cycle/)

## Problem Statement

Given head of a linked list, determine if the list has a cycle in it.

**Example**:
```
Input: head = [3,2,0,-4], pos = 1 (cycle at position 1)
Output: true
```

## Approach

Use two pointers:

- Slow moves one step per iteration
- Fast moves two steps per iteration
- If they meet, there's a cycle
- If fast reaches end (None), no cycle

## Solution

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

## Step-by-Step Walkthrough

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
  slow == fast - Cycle detected!

Result: True
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
