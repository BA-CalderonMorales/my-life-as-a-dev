# Middle of the Linked List

**Difficulty**: Easy  
**LeetCode**: [#876](https://leetcode.com/problems/middle-of-the-linked-list/)

## Problem Statement

Given a linked list, return the middle node. If there are two middle nodes, return the second one.

**Example**:
```
Input: head = [1,2,3,4,5]
Output: [3,4,5] (node with value 3)
```

## Approach

Use two pointers:

- When fast pointer reaches end, slow pointer is at middle
- Fast moves 2x speed, so slow is at halfway point when fast finishes

## Solution

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

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

## Step-by-Step Walkthrough

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

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
