---
tags:
  - Algorithms
  - Interview
  - Learning
comments: true
---

# Space Complexity Analysis

Space complexity measures the amount of memory an algorithm uses relative to its input size. Understanding space complexity is crucial for writing efficient algorithms, especially when dealing with large datasets or memory-constrained environments.

## What Is Space Complexity?

Space complexity describes how much additional memory an algorithm needs as the input grows. It includes:


- **Auxiliary Space**: Extra space used by the algorithm (temporary variables, data structures)
- **Input Space**: Space needed to store the input (sometimes excluded from analysis)

When we talk about space complexity, we typically refer to auxiliary space.

## Big O Notation for Space

Just like time complexity, we use Big O notation to describe space complexity:


- **O(1)**: Constant space - uses fixed amount of memory
- **O(log n)**: Logarithmic space - grows logarithmically with input
- **O(n)**: Linear space - grows proportionally with input
- **O(n²)**: Quadratic space - grows with square of input
- **O(2ⁿ)**: Exponential space - doubles with each input increase

## Common Space Complexities

### O(1) - Constant Space

Algorithm uses fixed amount of memory regardless of input size.

```python
def sum_array(arr):
    """
    Sum array elements.
    
    Time Complexity: O(n)
    Space Complexity: O(1) - only uses total variable
    """
    total = 0
    for num in arr:
        total += num
    return total

def swap_elements(arr, i, j):
    """
    Swap two elements in place.
    
    Space Complexity: O(1) - no extra space needed
    """
    arr[i], arr[j] = arr[j], arr[i]

def reverse_in_place(arr):
    """
    Reverse array in place.
    
    Space Complexity: O(1) - uses only two pointers
    """
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
```

### O(log n) - Logarithmic Space

Common in divide-and-conquer algorithms, often from recursion stack.

```python
def binary_search_recursive(arr, target, left, right):
    """
    Binary search (recursive).
    
    Time Complexity: O(log n)
    Space Complexity: O(log n) - recursion stack depth
    """
    if left > right:
        return -1
    
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    else:
        return binary_search_recursive(arr, target, left, mid - 1)

# Iterative version has O(1) space
def binary_search_iterative(arr, target):
    """
    Binary search (iterative).
    
    Space Complexity: O(1) - no recursion
    """
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1
```

### O(n) - Linear Space

Algorithm creates data structures proportional to input size.

```python
def copy_array(arr):
    """
    Create copy of array.
    
    Space Complexity: O(n) - new array of size n
    """
    return arr[:]

def build_frequency_map(arr):
    """
    Build frequency map.
    
    Space Complexity: O(n) - worst case, all unique elements
    """
    freq = {}
    for num in arr:
        freq[num] = freq.get(num, 0) + 1
    return freq

def generate_subsets(arr):
    """
    Generate all subsets.
    
    Space Complexity: O(2^n) - stores all subsets
    But if we only count recursion stack: O(n)
    """
    result = []
    
    def backtrack(start, current):
        result.append(current[:])
        for i in range(start, len(arr)):
            current.append(arr[i])
            backtrack(i + 1, current)
            current.pop()
    
    backtrack(0, [])
    return result
```

### O(n²) - Quadratic Space

Algorithm creates 2D data structures.

```python
def create_matrix(n):
    """
    Create n x n matrix.
    
    Space Complexity: O(n²)
    """
    return [[0] * n for _ in range(n)]

def build_distance_matrix(points):
    """
    Build distance matrix for all point pairs.
    
    Space Complexity: O(n²)
    """
    n = len(points)
    distances = [[0] * n for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            distances[i][j] = calculate_distance(points[i], points[j])
    
    return distances
```

## Recursion and Space Complexity

Recursive calls use stack space. Maximum recursion depth determines space complexity.

### Linear Recursion

```python
def factorial(n):
    """
    Factorial (recursive).
    
    Space Complexity: O(n) - n recursive calls on stack
    """
    if n <= 1:
        return 1
    return n * factorial(n - 1)

def print_array(arr, i=0):
    """
    Print array recursively.
    
    Space Complexity: O(n) - recursion depth
    """
    if i >= len(arr):
        return
    print(arr[i])
    print_array(arr, i + 1)
```

### Tree Recursion

```python
def fibonacci_recursive(n):
    """
    Fibonacci (recursive, no memoization).
    
    Time Complexity: O(2^n)
    Space Complexity: O(n) - maximum recursion depth
    """
    if n <= 1:
        return n
    return fibonacci_recursive(n - 1) + fibonacci_recursive(n - 2)

# With memoization
def fibonacci_memo(n, memo=None):
    """
    Fibonacci with memoization.
    
    Space Complexity: O(n) - memo dict + recursion stack
    """
    if memo is None:
        memo = {}
    
    if n in memo:
        return memo[n]
    
    if n <= 1:
        return n
    
    memo[n] = fibonacci_memo(n - 1, memo) + fibonacci_memo(n - 2, memo)
    return memo[n]
```

## Time-Space Trade-offs

Often, we can reduce time complexity by using more space, or reduce space by accepting slower runtime.

### Example 1: Two Sum

**Space-Optimized (O(1) space, O(n²) time)**:

```python
def two_sum_space_optimized(nums, target):
    """
    Find two numbers that sum to target.
    
    Time Complexity: O(n²)
    Space Complexity: O(1)
    """
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
```

**Time-Optimized (O(n) space, O(n) time)**:

```python
def two_sum_time_optimized(nums, target):
    """
    Find two numbers that sum to target using hash table.
    
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
```

### Example 2: Fibonacci

**Space-Optimized Iterative (O(1) space)**:

```python
def fibonacci_space_optimized(n):
    """
    Fibonacci using only two variables.
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    if n <= 1:
        return n
    
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    
    return curr
```

**With Memoization (O(n) space, faster for multiple queries)**:

```python
def fibonacci_with_cache(n, cache=None):
    """
    Fibonacci with caching for multiple queries.
    
    Space Complexity: O(n) - but amortized over many queries
    """
    if cache is None:
        cache = {}
    
    if n in cache:
        return cache[n]
    
    if n <= 1:
        cache[n] = n
    else:
        cache[n] = fibonacci_with_cache(n - 1, cache) + fibonacci_with_cache(n - 2, cache)
    
    return cache[n]
```

## Analyzing Space Complexity

### Step-by-Step Process

1. **Identify extra data structures**: Arrays, lists, sets, maps, etc.
2. **Count recursion depth**: Maximum call stack size
3. **Consider input modification**: Is input modified in place?
4. **Sum all space**: Add up all auxiliary space usage

### Example Analysis

```python
def merge_sort(arr):
    """
    Merge sort implementation.
    
    Let's analyze space complexity:
    1. Recursion depth: O(log n) - binary division
    2. Merge operation: O(n) - temporary array for merging
    3. Total: O(n) - dominated by merge arrays
    """
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])    # O(n) space for slicing
    right = merge_sort(arr[mid:])   # O(n) space for slicing
    
    return merge(left, right)       # O(n) space for result

def merge(left, right):
    """Merge two sorted arrays."""
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result
```

## In-Place Algorithms

In-place algorithms modify input data structure directly, using O(1) extra space.

```python
def quick_sort_in_place(arr, low, high):
    """
    Quick sort (in-place).
    
    Time Complexity: O(n log n) average
    Space Complexity: O(log n) - recursion stack only
    """
    if low < high:
        pivot_index = partition(arr, low, high)
        quick_sort_in_place(arr, low, pivot_index - 1)
        quick_sort_in_place(arr, pivot_index + 1, high)

def partition(arr, low, high):
    """Partition array around pivot."""
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

def remove_duplicates_in_place(arr):
    """
    Remove duplicates from sorted array in place.
    
    Space Complexity: O(1) - only uses write pointer
    """
    if not arr:
        return 0
    
    write = 1
    for read in range(1, len(arr)):
        if arr[read] != arr[write - 1]:
            arr[write] = arr[read]
            write += 1
    
    return write
```

## Common Patterns

### Pattern 1: Constant Space with Pointers

Use pointers to track positions without extra arrays.

```python
def move_zeros(arr):
    """
    Move zeros to end in place.
    
    Space Complexity: O(1)
    """
    write = 0
    for read in range(len(arr)):
        if arr[read] != 0:
            arr[write], arr[read] = arr[read], arr[write]
            write += 1
```

### Pattern 2: Hash Map for O(n) Space

Trade space for time using hash maps.

```python
def group_anagrams(words):
    """
    Group anagrams together.
    
    Space Complexity: O(n * k) where k is max word length
    """
    from collections import defaultdict
    
    groups = defaultdict(list)
    for word in words:
        key = ''.join(sorted(word))
        groups[key].append(word)
    
    return list(groups.values())
```

### Pattern 3: Recursion Stack

Be aware of recursion depth.

```python
def depth_first_search(node, visited=None):
    """
    DFS traversal.
    
    Space Complexity: O(h) where h is tree height
    For balanced tree: O(log n)
    For skewed tree: O(n)
    """
    if visited is None:
        visited = set()
    
    if node in visited:
        return
    
    visited.add(node)
    for neighbor in node.neighbors:
        depth_first_search(neighbor, visited)
```

## Practice Tips

- Always consider both time and space complexity
- Look for opportunities to use O(1) space (in-place modifications)
- Consider iterative vs recursive implementations
- Think about auxiliary space vs input space
- Remember recursion uses stack space
- Consider memory constraints in real systems

## Common Mistakes

- Forgetting to count recursion stack space
- Not considering temporary arrays/lists created during operations
- Confusing space complexity with time complexity
- Assuming all in-place algorithms are O(1) space (recursion!)
- Not accounting for all data structures used
- Forgetting about space used by hash collisions
- Not considering worst-case space usage

## Further Learning

The analysis techniques and examples above provide comprehensive coverage of space complexity fundamentals. For additional perspectives:


- **Formal Analysis**: Academic resources may provide mathematical proofs and formal definitions of auxiliary space
- **Language-Specific Memory Models**: Different languages have different memory management characteristics (garbage collection, stack vs heap allocation)
- **Advanced Topics**: Cache-aware algorithms and memory hierarchy considerations in modern processors

The key is developing intuition for recognizing space usage patterns and understanding trade-offs between time and space in real-world scenarios.

## Practice on LeetCode

- [73. Set Matrix Zeroes](https://leetcode.com/problems/set-matrix-zeroes/)
- [287. Find the Duplicate Number](https://leetcode.com/problems/find-the-duplicate-number/)
- [448. Find All Numbers Disappeared in an Array](https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/)
