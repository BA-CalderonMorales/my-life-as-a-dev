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

## Essential Linked List Algorithms: From Traversal to Reversal

Linked lists are fundamental data structures that require careful pointer manipulation. Master these essential techniques to solve any linked list problem.

### Technique 1: Reversal (Iterative)

**Core skill**: Rewiring pointers while maintaining references.

```python
def reverse_linked_list(head):
    """
    Reverse linked list iteratively.
    
    Time: O(n)
    Space: O(1)
    
    Key: Three pointers to track prev, current, next
    """
    prev = None
    current = head
    
    while current:
        # Save next node
        next_node = current.next
        
        # Reverse pointer
        current.next = prev
        
        # Move pointers forward
        prev = current
        current = next_node
    
    return prev  # New head

# Visualization:
# Before: 1 -> 2 -> 3 -> None
# After:  None <- 1 <- 2 <- 3
#                           ^head
```

**Recursive approach**:

```python
def reverse_recursive(head):
    """
    Reverse linked list recursively.
    
    Time: O(n)
    Space: O(n) - call stack
    
    Pattern: Reverse rest of list, then fix current node
    """
    # Base case
    if not head or not head.next:
        return head
    
    # Reverse rest of list
    new_head = reverse_recursive(head.next)
    
    # Fix current node's next pointer
    head.next.next = head
    head.next = None
    
    return new_head
```

### Technique 2: Reversal in Range

**Problem**: Reverse nodes from position m to n.

```python
def reverse_between(head, m, n):
    """
    Reverse linked list from position m to n.
    
    Example: 1->2->3->4->5, m=2, n=4
    Result: 1->4->3->2->5
    
    Time: O(n)
    Space: O(1)
    """
    if not head or m == n:
        return head
    
    dummy = ListNode(0)
    dummy.next = head
    prev = dummy
    
    # Move to node before m
    for _ in range(m - 1):
        prev = prev.next
    
    # Reverse from m to n
    reverse_start = prev.next
    current = reverse_start.next
    
    for _ in range(n - m):
        # Move current to after prev
        reverse_start.next = current.next
        current.next = prev.next
        prev.next = current
        current = reverse_start.next
    
    return dummy.next
```

### Technique 3: Merge Two Sorted Lists

**Pattern**: Compare and link nodes alternately.

```python
def merge_two_lists(l1, l2):
    """
    Merge two sorted linked lists.
    
    Time: O(n + m)
    Space: O(1) - reuses existing nodes
    """
    dummy = ListNode(0)
    current = dummy
    
    while l1 and l2:
        if l1.val < l2.val:
            current.next = l1
            l1 = l1.next
        else:
            current.next = l2
            l2 = l2.next
        current = current.next
    
    # Attach remaining nodes
    current.next = l1 if l1 else l2
    
    return dummy.next

# Recursive approach (elegant but O(n) space)
def merge_recursive(l1, l2):
    """Recursive merge."""
    if not l1:
        return l2
    if not l2:
        return l1
    
    if l1.val < l2.val:
        l1.next = merge_recursive(l1.next, l2)
        return l1
    else:
        l2.next = merge_recursive(l1, l2.next)
        return l2
```

### Technique 4: Reorder List

**Problem**: L0 → L1 → ... → Ln-1 → Ln becomes L0 → Ln → L1 → Ln-1 → ...

```python
def reorder_list(head):
    """
    Reorder list by interleaving first and second halves.
    
    Example: 1->2->3->4->5 becomes 1->5->2->4->3
    
    Strategy:
    1. Find middle using fast/slow pointers
    2. Reverse second half
    3. Merge two halves alternately
    
    Time: O(n)
    Space: O(1)
    """
    if not head or not head.next:
        return
    
    # Step 1: Find middle
    slow = fast = head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next
    
    # Step 2: Reverse second half
    second = slow.next
    slow.next = None  # Split list
    second = reverse_linked_list(second)
    
    # Step 3: Merge alternately
    first = head
    while second:
        temp1 = first.next
        temp2 = second.next
        
        first.next = second
        second.next = temp1
        
        first = temp1
        second = temp2
```

### Technique 5: Remove Nth Node From End

**Pattern**: Two-pass vs one-pass with gap.

```python
def remove_nth_from_end_one_pass(head, n):
    """
    Remove nth node from end in one pass.
    
    Strategy: Maintain gap of n between two pointers
    
    Time: O(L) where L is list length
    Space: O(1)
    """
    dummy = ListNode(0)
    dummy.next = head
    
    fast = slow = dummy
    
    # Move fast ahead by n steps
    for _ in range(n):
        fast = fast.next
    
    # Move both until fast reaches end
    while fast.next:
        fast = fast.next
        slow = slow.next
    
    # Remove node
    slow.next = slow.next.next
    
    return dummy.next
```

### Technique 6: Deep Copy with Random Pointer

**Problem**: Clone list where nodes have both next and random pointers.

```python
class Node:
    def __init__(self, val, next=None, random=None):
        self.val = val
        self.next = next
        self.random = random

def copy_random_list(head):
    """
    Clone list with random pointers.
    
    Strategy: Interweave original and copied nodes
    
    Time: O(n)
    Space: O(1) - excluding output
    """
    if not head:
        return None
    
    # Step 1: Create copy nodes interweaved with originals
    # Original: A -> B -> C
    # Result:   A -> A' -> B -> B' -> C -> C'
    current = head
    while current:
        copy = Node(current.val)
        copy.next = current.next
        current.next = copy
        current = copy.next
    
    # Step 2: Set random pointers for copies
    current = head
    while current:
        if current.random:
            current.next.random = current.random.next
        current = current.next.next
    
    # Step 3: Separate original and copy lists
    current = head
    copy_head = head.next
    while current:
        copy = current.next
        current.next = copy.next
        if copy.next:
            copy.next = copy.next.next
        current = current.next
    
    return copy_head

# Alternative: Hash map approach (O(n) space but simpler)
def copy_random_list_hash(head):
    """Clone using hash map."""
    if not head:
        return None
    
    # Map original -> copy
    old_to_new = {}
    
    # First pass: create all nodes
    current = head
    while current:
        old_to_new[current] = Node(current.val)
        current = current.next
    
    # Second pass: link nodes
    current = head
    while current:
        if current.next:
            old_to_new[current].next = old_to_new[current.next]
        if current.random:
            old_to_new[current].random = old_to_new[current.random]
        current = current.next
    
    return old_to_new[head]
```

### Technique 7: Sort List

**Problem**: Sort linked list in O(n log n) time.

```python
def sort_list(head):
    """
    Sort linked list using merge sort.
    
    Time: O(n log n)
    Space: O(log n) - recursion stack
    
    Why merge sort? 
    - No random access → can't use quicksort efficiently
    - Linked list merge is O(1) space
    """
    if not head or not head.next:
        return head
    
    # Find middle using fast/slow
    slow = fast = head
    prev = None
    
    while fast and fast.next:
        prev = slow
        slow = slow.next
        fast = fast.next.next
    
    # Split into two halves
    prev.next = None
    
    # Recursively sort each half
    left = sort_list(head)
    right = sort_list(slow)
    
    # Merge sorted halves
    return merge_two_lists(left, right)
```

### Technique 8: Add Two Numbers

**Pattern**: Traverse both lists simultaneously with carry.

```python
def add_two_numbers(l1, l2):
    """
    Add two numbers represented as linked lists.
    
    Example: (2 -> 4 -> 3) + (5 -> 6 -> 4) = (7 -> 0 -> 8)
    Represents: 342 + 465 = 807
    
    Time: O(max(n, m))
    Space: O(max(n, m))
    """
    dummy = ListNode(0)
    current = dummy
    carry = 0
    
    while l1 or l2 or carry:
        # Get values (0 if list exhausted)
        val1 = l1.val if l1 else 0
        val2 = l2.val if l2 else 0
        
        # Calculate sum and carry
        total = val1 + val2 + carry
        carry = total // 10
        digit = total % 10
        
        # Create new node
        current.next = ListNode(digit)
        current = current.next
        
        # Move to next nodes
        if l1:
            l1 = l1.next
        if l2:
            l2 = l2.next
    
    return dummy.next
```

### Technique 9: Flatten Multilevel List

**Problem**: Flatten list with child pointers into single level.

```python
def flatten(head):
    """
    Flatten doubly linked list with child pointers.
    
    Strategy: DFS to process child lists recursively
    
    Time: O(n)
    Space: O(n) - recursion stack
    """
    if not head:
        return head
    
    def flatten_dfs(node):
        """
        Flatten starting from node.
        Returns tail of flattened list.
        """
        current = node
        tail = None
        
        while current:
            next_node = current.next
            
            # Process child
            if current.child:
                child_tail = flatten_dfs(current.child)
                
                # Insert child list
                current.next = current.child
                current.child.prev = current
                current.child = None
                
                # Link to rest of list
                if next_node:
                    child_tail.next = next_node
                    next_node.prev = child_tail
                
                tail = child_tail
                current = next_node
            else:
                tail = current
                current = next_node
        
        return tail
    
    flatten_dfs(head)
    return head
```

### Common Patterns Summary

| Pattern | When to Use | Key Technique |
|---------|------------|---------------|
| Reversal | Reorder nodes | Three pointers (prev, curr, next) |
| Merge | Combine sorted lists | Dummy node + comparison |
| Reorder | Interleave halves | Find middle + reverse + merge |
| Remove | Delete nodes | Fast pointer ahead + gap |
| Copy | Clone complex structures | Interweave or hash map |
| Sort | Order nodes | Merge sort (O(n log n)) |
| Add | Arithmetic on lists | Carry propagation |
| Flatten | Multilevel to single | DFS with tail tracking |

### Practice Strategy

1. **Master reversal first** - Foundation for many problems
2. **Use dummy nodes** - Simplifies edge case handling
3. **Draw diagrams** - Visualize pointer changes
4. **Test edge cases**: Empty, single node, two nodes
5. **Check for cycles** - Prevent infinite loops

## Further Learning

The techniques above cover essential linked list manipulations for interviews and real-world applications. For additional perspectives:

- **Theoretical Analysis**: Academic resources may provide formal proofs of algorithm correctness
- **Language-Specific Optimizations**: Different memory management strategies in C++, Java, Python
- **Advanced Topics**: Skip lists, XOR linked lists, and memory-efficient variants

The key is understanding pointer manipulation and being able to trace through operations step-by-step on paper before coding.

## Practice on LeetCode

- [141. Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/)
- [142. Linked List Cycle II](https://leetcode.com/problems/linked-list-cycle-ii/)
- [876. Middle of the Linked List](https://leetcode.com/problems/middle-of-the-linked-list/)
