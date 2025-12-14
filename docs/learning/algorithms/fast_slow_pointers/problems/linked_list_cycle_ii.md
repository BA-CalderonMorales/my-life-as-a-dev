# Linked List Cycle II

**Difficulty**: Medium  
**LeetCode**: [#142](https://leetcode.com/problems/linked-list-cycle-ii/)

## Problem Statement

Given a linked list, return the node where the cycle begins. If no cycle, return null.

**Example**:
```
Input: head = [3,2,0,-4], pos = 1
Output: Node with value 2 (cycle starts here)
```

## Approach

Two-phase algorithm:

**Phase 1**: Detect cycle (same as Linked List Cycle I)

- If no cycle, return None

**Phase 2**: Find cycle start

- Reset one pointer to head
- Move both pointers one step at a time
- Where they meet is the cycle start

**Why this works**: Mathematical proof based on distances traveled.

## Solution

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

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

# Test helper
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
cycle_start = detect_cycle(head)
print(cycle_start.val if cycle_start else None)  # Output: 2
```

## Step-by-Step Walkthrough

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

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
