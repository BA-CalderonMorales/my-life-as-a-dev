# Array Data Structures

Arrays are fundamental data structures that store elements in contiguous memory locations, enabling efficient access by index. Understanding arrays deeply is essential for solving algorithmic problems and building efficient systems.

## What Are Arrays?

An array is a collection of elements stored at consecutive memory addresses. Each element can be accessed directly using its index, making arrays one of the most efficient data structures for random access.

### Key Properties

- **Fixed Size**: Classic arrays have a predetermined size
- **Contiguous Memory**: Elements stored sequentially in memory
- **Index-Based Access**: O(1) time to access any element
- **Homogeneous**: Typically store elements of the same type

## Array Variations

### One-Dimensional Arrays

The simplest form: a linear sequence of elements.

```python
# Python list (dynamic array)
arr = [1, 2, 3, 4, 5]

# Access element
print(arr[2])  # Output: 3

# Update element
arr[2] = 10

# Iterate
for num in arr:
    print(num)
```

### Multidimensional Arrays

Arrays with multiple dimensions, commonly used for matrices, grids, and tables.

**Two-Dimensional Arrays (Matrices)**:

```python
# 2D array (matrix)
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

# Access element at row i, column j
print(matrix[1][2])  # Output: 6

# Iterate through 2D array
for i in range(len(matrix)):
    for j in range(len(matrix[i])):
        print(matrix[i][j], end=' ')
    print()
```

**Higher Dimensions**:

```python
# 3D array (cube)
cube = [
    [[1, 2], [3, 4]],
    [[5, 6], [7, 8]]
]

# Access element at [layer][row][col]
print(cube[0][1][0])  # Output: 3
```

### Dynamic Arrays

Arrays that can grow or shrink in size automatically.

```python
# Python lists are dynamic arrays
dynamic = []

# Append (amortized O(1))
dynamic.append(1)
dynamic.append(2)

# Insert at position (O(n))
dynamic.insert(0, 0)

# Remove element (O(n))
dynamic.remove(1)

# Pop from end (O(1))
dynamic.pop()
```

## Common Operations

### Access

```python
# Direct access by index: O(1)
element = arr[index]
```

### Search

```python
# Linear search: O(n)
def linear_search(arr, target):
    for i, num in enumerate(arr):
        if num == target:
            return i
    return -1

# Binary search (sorted array): O(log n)
def binary_search(arr, target):
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

### Insert

```python
# Insert at end (dynamic array): O(1) amortized
arr.append(value)

# Insert at position: O(n)
arr.insert(index, value)
```

### Delete

```python
# Delete from end: O(1)
arr.pop()

# Delete from position: O(n)
arr.pop(index)
del arr[index]

# Delete by value: O(n)
arr.remove(value)
```

### Update

```python
# Update element: O(1)
arr[index] = new_value
```

## Common Patterns

### Prefix Sum

Efficiently compute range sums.

```python
def build_prefix_sum(arr):
    """Build prefix sum array."""
    prefix = [0] * (len(arr) + 1)
    for i in range(len(arr)):
        prefix[i + 1] = prefix[i] + arr[i]
    return prefix

def range_sum(prefix, left, right):
    """Get sum of elements from left to right (inclusive)."""
    return prefix[right + 1] - prefix[left]

# Example
arr = [1, 2, 3, 4, 5]
prefix = build_prefix_sum(arr)
print(range_sum(prefix, 1, 3))  # Sum of arr[1:4] = 2+3+4 = 9
```

### Two Pointers

Process array from both ends or with fast/slow pointers.

```python
def reverse_array(arr):
    """Reverse array in-place using two pointers."""
    left, right = 0, len(arr) - 1
    
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
```

### Sliding Window

Maintain a window of elements.

```python
def max_sum_subarray(arr, k):
    """Find maximum sum of k consecutive elements."""
    if len(arr) < k:
        return None
    
    # Initial window
    window_sum = sum(arr[:k])
    max_sum = window_sum
    
    # Slide window
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
    
    return max_sum
```

## Matrix Operations

### Matrix Traversal

```python
def traverse_matrix(matrix):
    """Common traversal patterns."""
    rows, cols = len(matrix), len(matrix[0])
    
    # Row-wise
    for i in range(rows):
        for j in range(cols):
            print(matrix[i][j])
    
    # Column-wise
    for j in range(cols):
        for i in range(rows):
            print(matrix[i][j])
    
    # Diagonal
    for i in range(min(rows, cols)):
        print(matrix[i][i])
```

### Matrix Rotation

```python
def rotate_90_clockwise(matrix):
    """Rotate n x n matrix 90 degrees clockwise in-place."""
    n = len(matrix)
    
    # Transpose
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    
    # Reverse each row
    for i in range(n):
        matrix[i].reverse()
```

### Spiral Traversal

```python
def spiral_order(matrix):
    """Traverse matrix in spiral order."""
    if not matrix:
        return []
    
    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    
    while top <= bottom and left <= right:
        # Right
        for j in range(left, right + 1):
            result.append(matrix[top][j])
        top += 1
        
        # Down
        for i in range(top, bottom + 1):
            result.append(matrix[i][right])
        right -= 1
        
        # Left
        if top <= bottom:
            for j in range(right, left - 1, -1):
                result.append(matrix[bottom][j])
            bottom -= 1
        
        # Up
        if left <= right:
            for i in range(bottom, top - 1, -1):
                result.append(matrix[i][left])
            left += 1
    
    return result
```

## Performance Characteristics

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Access by index | O(1) | O(1) |
| Search (unsorted) | O(n) | O(1) |
| Search (sorted) | O(log n) | O(1) |
| Insert at end (dynamic) | O(1) amortized | O(1) |
| Insert at position | O(n) | O(1) |
| Delete from end | O(1) | O(1) |
| Delete from position | O(n) | O(1) |

## Common Applications

### Data Storage
- Sequential data storage
- Fixed-size collections
- Buffer implementation

### Algorithm Building Blocks
- Sorting algorithms
- Searching algorithms
- Graph representations (adjacency matrix)

### Image Processing
- Pixel data storage (2D/3D arrays)
- Convolution operations
- Image transformations

### Mathematical Operations
- Matrix operations
- Vector operations
- Numerical computations

## Practice Tips

- Master index manipulation and boundary handling
- Understand in-place vs extra space trade-offs
- Practice common patterns: two pointers, sliding window, prefix sums
- Visualize array state changes during operations
- Consider edge cases: empty arrays, single elements, duplicates
- Think about space complexity for multidimensional problems

## Common Mistakes

- Off-by-one errors in loops and indices
- Array index out of bounds
- Modifying array while iterating
- Not handling empty array cases
- Inefficient nested loop operations
- Memory issues with large multidimensional arrays
- Forgetting to handle matrix dimensions properly

## External Resources

For comprehensive learning on array data structures:

- [All You Need to Know About the Array Data Structure](https://lnkd.in/ekJMPDjy) - Complete guide covering one-dimensional arrays, multidimensional arrays, and dynamic arrays. Essential resource for understanding array fundamentals, memory management, and optimization techniques.

- [How to Quickly Calculate Range Queries on Arrays Using Prefix Sum and Sparse Tables](https://lnkd.in/emgb2dA6) - Advanced techniques for efficient range query operations. Learn how to optimize sum, min, and max queries from O(n) to O(1) or O(log n) using preprocessing techniques.
