---
tags:
  - Algorithms
  - Interview
  - Data Structures
comments: true
---

# Heap and Priority Queue Pattern

A heap is a tree-based data structure that maintains elements in a specific order. A priority queue is typically implemented using a heap and allows efficient access to the minimum or maximum element. This pattern is essential for problems requiring frequent access to extremes or maintaining sorted order dynamically.

## When to Use Heap/Priority Queue

Use this pattern when:


- Need to repeatedly access minimum or maximum element
- Finding k largest or smallest elements
- Maintaining a running median or percentile
- Merging k sorted lists or streams
- Scheduling tasks based on priority
- Implementing Dijkstra's shortest path algorithm

## Core Approach

### Heap Operations

**Min Heap**: Parent ≤ Children (smallest at root)
**Max Heap**: Parent ≥ Children (largest at root)

- **Key Operations**

    - `push(x)`: Insert element - O(log n)
    - `pop()`: Remove min/max - O(log n)
    - `peek()`: View min/max - O(1)
    - `heapify()`: Build heap - O(n)

### Common Patterns

1. **K-th Element Problems**: Use heap of size k
2. **Merge Streams**: Use min heap with one element from each stream
3. **Scheduling**: Use heap ordered by deadline or priority
4. **Running Statistics**: Use two heaps (min and max)

## Problem 1: Kth Largest Element in an Array

**Difficulty**: Medium  
**LeetCode**: #215

### Problem Statement

Find the kth largest element in an unsorted array. Note that it is the kth largest element in sorted order, not the kth distinct element.

**Example**:
```
Input: nums = [3, 2, 1, 5, 6, 4], k = 2
Output: 5
Explanation: The array sorted is [1, 2, 3, 4, 5, 6], so 2nd largest is 5
```

### Approach

Use a min heap of size k:

- Maintain k largest elements in heap
- Smallest of these k elements is at root (kth largest overall)
- When heap exceeds size k, remove smallest element

This ensures we always have k largest elements, with kth largest at top.

### Solution

```python
import heapq

def find_kth_largest(nums, k):
    """
    Find kth largest element using min heap.
    
    Time Complexity: O(n log k) - process n elements with heap of size k
    Space Complexity: O(k) - heap stores k elements
    """
    # Maintain min heap of k largest elements
    min_heap = []
    
    for num in nums:
        heapq.heappush(min_heap, num)
        
        # Keep heap size at k
        if len(min_heap) > k:
            heapq.heappop(min_heap)
    
    # Root of min heap is kth largest
    return min_heap[0]

# Alternative: Using Python's nlargest
def find_kth_largest_alt(nums, k):
    """Alternative using heapq.nlargest."""
    return heapq.nlargest(k, nums)[-1]

# Test
nums = [3, 2, 1, 5, 6, 4]
k = 2
print(find_kth_largest(nums, k))  # Output: 5
```

### Step-by-Step Walkthrough

```
nums = [3, 2, 1, 5, 6, 4], k = 2

Process nums[0]=3:
  heap = [3], size = 1 < k, keep all

Process nums[1]=2:
  heap = [2, 3], size = 2 = k, keep all
  Min heap: 2 at root

Process nums[2]=1:
  heap = [1, 3, 2], size = 3 > k
  Pop smallest: heap = [2, 3]
  Min heap: 2 at root

Process nums[3]=5:
  heap = [2, 5, 3], size = 3 > k
  Pop smallest: heap = [3, 5]
  Min heap: 3 at root

Process nums[4]=6:
  heap = [3, 5, 6], size = 3 > k
  Pop smallest: heap = [5, 6]
  Min heap: 5 at root

Process nums[5]=4:
  heap = [4, 6, 5], size = 3 > k
  Pop smallest: heap = [5, 6]
  Min heap: 5 at root

Result: 5 (kth largest element)

Heap maintains 2 largest elements: [5, 6]
Smallest of these (at root) is kth largest: 5
```

## Problem 2: Merge K Sorted Lists

**Difficulty**: Hard  
**LeetCode**: #23

### Problem Statement

Merge k sorted linked lists into one sorted linked list.

**Example**:
```
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
```

### Approach

Use min heap to track smallest unprocessed element from each list:
1. Add first element from each list to heap
2. Pop smallest element, add to result
3. Add next element from same list to heap
4. Repeat until all elements processed

Heap efficiently finds minimum among k candidates.

### Solution

```python
import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def merge_k_lists(lists):
    """
    Merge k sorted linked lists.
    
    Time Complexity: O(n log k) - n total nodes, heap operations on k elements
    Space Complexity: O(k) - heap stores at most k nodes
    """
    # Min heap: (value, list_index, node)
    # Use index to break ties (Python heapq requires comparable elements)
    min_heap = []
    
    # Add first node from each list
    for i, head in enumerate(lists):
        if head:
            heapq.heappush(min_heap, (head.val, i, head))
    
    # Dummy head for result list
    dummy = ListNode(0)
    current = dummy
    
    while min_heap:
        # Get smallest element
        val, i, node = heapq.heappop(min_heap)
        
        # Add to result
        current.next = node
        current = current.next
        
        # Add next node from same list
        if node.next:
            heapq.heappush(min_heap, (node.next.val, i, node.next))
    
    return dummy.next

# Helper to create linked list from array
def create_list(arr):
    """Create linked list from array."""
    dummy = ListNode(0)
    current = dummy
    for val in arr:
        current.next = ListNode(val)
        current = current.next
    return dummy.next

# Helper to convert linked list to array
def list_to_array(head):
    """Convert linked list to array."""
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result

# Test
lists = [
    create_list([1, 4, 5]),
    create_list([1, 3, 4]),
    create_list([2, 6])
]
merged = merge_k_lists(lists)
print(list_to_array(merged))  # Output: [1, 1, 2, 3, 4, 4, 5, 6]
```

### Step-by-Step Walkthrough

```
lists = [[1,4,5], [1,3,4], [2,6]]

Initialize heap with first nodes:
  heap = [(1, 0, node1), (1, 1, node1'), (2, 2, node2)]
  Heap structure (min): 1 at root

Iteration 1:
  Pop (1, 0, node1) - smallest
  Add to result: [1]
  Push next from list 0: (4, 0, node4)
  heap = [(1, 1, node1'), (2, 2, node2), (4, 0, node4)]

Iteration 2:
  Pop (1, 1, node1') - smallest
  Add to result: [1, 1]
  Push next from list 1: (3, 1, node3)
  heap = [(2, 2, node2), (3, 1, node3), (4, 0, node4)]

Iteration 3:
  Pop (2, 2, node2) - smallest
  Add to result: [1, 1, 2]
  Push next from list 2: (6, 2, node6)
  heap = [(3, 1, node3), (4, 0, node4), (6, 2, node6)]

Iteration 4:
  Pop (3, 1, node3)
  Add to result: [1, 1, 2, 3]
  Push next from list 1: (4, 1, node4')
  heap = [(4, 0, node4), (4, 1, node4'), (6, 2, node6)]

Iteration 5:
  Pop (4, 0, node4)
  Add to result: [1, 1, 2, 3, 4]
  Push next from list 0: (5, 0, node5)
  heap = [(4, 1, node4'), (5, 0, node5), (6, 2, node6)]

Iteration 6:
  Pop (4, 1, node4')
  Add to result: [1, 1, 2, 3, 4, 4]
  No next from list 1
  heap = [(5, 0, node5), (6, 2, node6)]

Iteration 7:
  Pop (5, 0, node5)
  Add to result: [1, 1, 2, 3, 4, 4, 5]
  No next from list 0
  heap = [(6, 2, node6)]

Iteration 8:
  Pop (6, 2, node6)
  Add to result: [1, 1, 2, 3, 4, 4, 5, 6]
  No next from list 2
  heap = []

Result: [1, 1, 2, 3, 4, 4, 5, 6]
```

## Problem 3: Find Median from Data Stream

**Difficulty**: Hard  
**LeetCode**: #295

### Problem Statement

Design a data structure that supports adding integers and finding the median efficiently.

**Example**:
```
MedianFinder mf = new MedianFinder()
mf.addNum(1)    
mf.addNum(2)    
mf.findMedian() -> 1.5
mf.addNum(3)    
mf.findMedian() -> 2
```

### Approach

Use two heaps to maintain balance:

- **Max heap** (left): Stores smaller half of numbers
- **Min heap** (right): Stores larger half of numbers

Median is either:

- Middle of max heap (if odd count)
- Average of both heap tops (if even count)

Maintain heaps such that:

- Sizes differ by at most 1
- All elements in max heap ≤ all elements in min heap

### Solution

```python
import heapq

class MedianFinder:
    """
    Maintain running median using two heaps.
    
    Time Complexity: 
      - addNum: O(log n) - heap operations
      - findMedian: O(1) - just peek at heap tops
    Space Complexity: O(n) - store all numbers
    """
    
    def __init__(self):
        # Max heap (smaller half) - use negative values for max heap
        self.small = []
        # Min heap (larger half)
        self.large = []
    
    def addNum(self, num):
        """Add number to data structure."""
        # Add to max heap (small) first
        heapq.heappush(self.small, -num)
        
        # Balance: ensure max(small) <= min(large)
        if self.small and self.large and (-self.small[0] > self.large[0]):
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)
        
        # Balance sizes: difference should be at most 1
        if len(self.small) > len(self.large) + 1:
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)
        elif len(self.large) > len(self.small):
            val = heapq.heappop(self.large)
            heapq.heappush(self.small, -val)
    
    def findMedian(self):
        """Find current median."""
        if len(self.small) > len(self.large):
            # Odd count: median is top of larger heap (small)
            return -self.small[0]
        else:
            # Even count: median is average of both tops
            return (-self.small[0] + self.large[0]) / 2.0

# Test
mf = MedianFinder()
mf.addNum(1)
mf.addNum(2)
print(mf.findMedian())  # Output: 1.5
mf.addNum(3)
print(mf.findMedian())  # Output: 2.0
```

### Step-by-Step Walkthrough

```
Operations: addNum(1), addNum(2), findMedian(), addNum(3), findMedian()

addNum(1):
  Push -1 to small: small = [-1], large = []
  No balancing needed (large is empty)
  Sizes: small=1, large=0

addNum(2):
  Push -2 to small: small = [-2, -1], large = []
  Check max(small) vs min(large): -(-2)=2 > empty, skip
  Balance sizes: small=2, large=0 (diff > 1)
    Move from small to large: pop -2, push 2
    small = [-1], large = [2]
  Sizes: small=1, large=1

findMedian():
  Even count: (1 + 2) / 2 = 1.5
  Result: 1.5

addNum(3):
  Push -3 to small: small = [-3, -1], large = [2]
  Check max(small) vs min(large): -(-3)=3 > 2
    Move max from small to large: pop -3, push 3
    small = [-1], large = [2, 3]
  Balance sizes: small=1, large=2 (large > small)
    Move from large to small: pop 2, push -2
    small = [-2, -1], large = [3]
  Sizes: small=2, large=1

findMedian():
  Odd count: top of small = -(-2) = 2
  Result: 2.0

Final state:
  small (max heap) = [-2, -1] → represents [2, 1]
  large (min heap) = [3]
  Numbers in order: 1, 2, 3
  Median: 2
```

## Key Takeaways

1. **Heap Selection**: Min heap for k largest, max heap for k smallest
2. **Size Matters**: Use heap when k < n for efficiency
3. **Two Heap Technique**: Powerful for running statistics
4. **Comparison Tuples**: Use tuples in heap for complex comparisons
5. **Python heapq**: Only provides min heap (negate for max heap)

## Common Applications

### Single Heap
- K-th largest/smallest elements
- Top K frequent elements
- Task scheduling by priority
- Dijkstra's shortest path

### Two Heaps
- Running median
- Sliding window median
- Balanced partitioning
- Stream percentiles

### Heap Merging
- Merge K sorted arrays
- Smallest range in K lists
- Find K pairs with smallest sums

## Practice Tips

- Decide between min heap and max heap based on what needs to be at root
- Consider heap size: keep k elements vs all elements
- For two heap problems, define clear invariants to maintain
- Remember Python heapq is min heap only (use negatives for max)
- Use tuples for complex element comparisons
- Think about time complexity: heap operations are O(log n)

## Template Pattern

```python
import heapq

# Single heap for k-th element
def kth_element_template(arr, k):
    """Find kth largest using min heap."""
    heap = []
    for num in arr:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]

# Two heaps for running median
class MedianTemplate:
    """Maintain running median."""
    def __init__(self):
        self.small = []  # max heap (negated)
        self.large = []  # min heap
    
    def add(self, num):
        heapq.heappush(self.small, -num)
        
        # Balance property
        if self.small and self.large and (-self.small[0] > self.large[0]):
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)
        
        # Balance sizes
        if len(self.small) > len(self.large) + 1:
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)
        elif len(self.large) > len(self.small):
            val = heapq.heappop(self.large)
            heapq.heappush(self.small, -val)
    
    def get_median(self):
        if len(self.small) > len(self.large):
            return -self.small[0]
        return (-self.small[0] + self.large[0]) / 2.0
```

## Common Mistakes

- Forgetting Python heapq is min heap only
- Not maintaining heap invariants with two heaps
- Using heap when array fits in memory (could sort instead)
- Incorrect size balancing in two heap problems
- Not handling edge cases (empty heaps, single element)
- Wrong complexity analysis (remember heapify is O(n), not O(n log n))

## Three Essential Real-World Applications

Beyond basic interview problems, heaps power critical algorithms in production systems. Here are three must-know applications:

### Application 1: Finding Largest/Smallest K Elements

Heaps excel at maintaining the k largest or smallest elements from a stream or large dataset.

- **Real-World Use Cases**

    - Top trending topics in social media
    - Top-performing employees or products
    - Monitoring system metrics (top CPU consumers)
    - Recommendation systems (top N items)

- **Why Heaps Win**

    - O(log k) insertion vs O(k) for sorted list
    - O(1) access to kth element vs O(k) for unsorted array
    - Memory efficient: only store k elements, not entire dataset

**Implementation Pattern**:

```python
def top_k_frequent(nums, k):
    """
    Find k most frequent elements using heap.
    
    Time: O(n log k) - Better than O(n log n) full sort
    Space: O(n) - frequency map + O(k) heap
    """
    from collections import Counter
    import heapq
    
    # Count frequencies
    freq = Counter(nums)
    
    # Min heap of size k (stores (freq, num) pairs)
    # Keep k largest frequencies
    heap = []
    for num, count in freq.items():
        heapq.heappush(heap, (count, num))
        if len(heap) > k:
            heapq.heappop(heap)
    
    # Extract numbers (discard frequencies)
    return [num for count, num in heap]

# Example: Social media trending
posts = [1, 1, 1, 2, 2, 3, 4, 4, 4, 4]
print(top_k_frequent(posts, 2))  # [1, 4] - top 2 posts
```

### Application 2: Graph Algorithms (Dijkstra's Shortest Path)

Heaps are fundamental to efficient graph algorithms, particularly for finding shortest paths.

- **Real-World Use Cases**

    - GPS navigation and route planning
    - Network routing protocols
    - Game AI pathfinding
    - Resource allocation in distributed systems

**Dijkstra's Algorithm with Heap**:

```python
import heapq
from collections import defaultdict

def dijkstra(graph, start):
    """
    Find shortest paths from start to all nodes.
    
    Time: O((V + E) log V) with heap
          O(V²) with simple array (worse for sparse graphs)
    Space: O(V)
    
    Args:
        graph: dict of node -> [(neighbor, weight)]
        start: starting node
    
    Returns:
        dict of node -> shortest distance from start
    """
    # Distance to each node (infinity initially)
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    
    # Min heap: (distance, node)
    heap = [(0, start)]
    visited = set()
    
    while heap:
        current_dist, node = heapq.heappop(heap)
        
        # Skip if already processed
        if node in visited:
            continue
        visited.add(node)
        
        # Update neighbors
        for neighbor, weight in graph[node]:
            distance = current_dist + weight
            
            # Found shorter path
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(heap, (distance, neighbor))
    
    return distances

# Example: Road network
roads = {
    'A': [('B', 4), ('C', 2)],
    'B': [('C', 1), ('D', 5)],
    'C': [('D', 8), ('E', 10)],
    'D': [('E', 2)],
    'E': []
}

distances = dijkstra(roads, 'A')
print(f"Shortest path A to E: {distances['E']}")  # 11
```

- **Why Heap Matters**

    - Without heap: Must scan all unvisited nodes to find minimum distance - O(V²)
    - With heap: Extract minimum in O(log V) - O((V + E) log V)
    - For sparse graphs (E << V²), heap version is dramatically faster

### Application 3: Huffman Encoding (Data Compression)

Huffman encoding builds optimal prefix-free codes for data compression using a heap-based greedy algorithm.

- **Real-World Use Cases**

    - File compression (ZIP, GZIP)
    - Image formats (JPEG uses variant)
    - Network data transmission
    - Database compression

**How It Works**:
1. Count character frequencies
2. Build heap of nodes (frequency, character)
3. Repeatedly merge two smallest nodes into parent
4. Result: Binary tree where frequent chars have shorter codes

**Implementation**:

```python
import heapq
from collections import Counter, namedtuple

Node = namedtuple('Node', ['freq', 'char', 'left', 'right'])

def huffman_encoding(text):
    """
    Build Huffman tree and generate codes.
    
    Time: O(n log n) - n chars, heap operations
    Space: O(n) - tree nodes
    """
    if not text:
        return {}, None
    
    # Count frequencies
    freq = Counter(text)
    
    # Build heap of leaf nodes
    # Use negative freq for max heap behavior (most frequent first)
    heap = [Node(f, ch, None, None) for ch, f in freq.items()]
    heapq.heapify(heap)
    
    # Build tree
    while len(heap) > 1:
        # Pop two smallest frequency nodes
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)
        
        # Create parent with combined frequency
        parent = Node(
            freq=left.freq + right.freq,
            char=None,  # Internal nodes have no character
            left=left,
            right=right
        )
        heapq.heappush(heap, parent)
    
    # Root of tree
    root = heap[0]
    
    # Generate codes (DFS on tree)
    codes = {}
    def generate_codes(node, code=''):
        if node.char is not None:  # Leaf node
            codes[node.char] = code or '0'  # Single char gets '0'
        else:
            if node.left:
                generate_codes(node.left, code + '0')
            if node.right:
                generate_codes(node.right, code + '1')
    
    generate_codes(root)
    return codes, root

def encode_text(text, codes):
    """Encode text using Huffman codes."""
    return ''.join(codes[ch] for ch in text)

def decode_text(encoded, root):
    """Decode using Huffman tree."""
    if not encoded:
        return ''
    
    result = []
    node = root
    
    for bit in encoded:
        # Traverse tree
        node = node.left if bit == '0' else node.right
        
        # Reached leaf
        if node.char is not None:
            result.append(node.char)
            node = root  # Reset to root
    
    return ''.join(result)

# Example
text = "huffman encoding example"
codes, tree = huffman_encoding(text)

print("Character codes:")
for char, code in sorted(codes.items()):
    print(f"  '{char}': {code}")

encoded = encode_text(text, codes)
print(f"\nOriginal: {len(text) * 8} bits")
print(f"Encoded:  {len(encoded)} bits")
print(f"Compression: {(1 - len(encoded)/(len(text)*8)) * 100:.1f}%")

decoded = decode_text(encoded, tree)
assert decoded == text, "Encoding/decoding failed!"
```

- **Compression Analysis**

    - Fixed-length encoding: Each character = 8 bits (ASCII)
    - Huffman encoding: Frequent characters get shorter codes
    - Typical compression: 20-90% depending on text redundancy

- **Why Heap Is Essential**

    - Greedy algorithm requires repeatedly finding minimum frequency nodes
    - Heap makes this O(log n) per merge
    - Without heap: O(n) scan each time → O(n²) total
    - With heap: O(n log n) total

## Further Learning

The applications above provide comprehensive coverage of heap usage in real systems. For additional perspectives and examples:


- **Advanced Heap Applications**: The external resource "Three Must-Know Applications of Heap Data Structures" offers alternative explanations and additional edge cases for these same topics.
- **Practice**: Implement these algorithms from scratch, then optimize. Understanding *why* heaps are chosen (vs alternatives) is more valuable than memorizing code.

## Practice on LeetCode

- [347. Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)
- [215. Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/)
- [1046. Last Stone Weight](https://leetcode.com/problems/last-stone-weight/)
