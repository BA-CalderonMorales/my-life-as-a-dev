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

## Practice on LeetCode

- [238. Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/)
- [53. Maximum Subarray](https://leetcode.com/problems/maximum-subarray/)
- [56. Merge Intervals](https://leetcode.com/problems/merge-intervals/)

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

## Advanced Range Query Techniques

When processing arrays, you often need to answer questions about ranges: "What's the sum from index i to j?" or "What's the minimum value in this range?" Naive approaches are O(n) per query. Advanced techniques reduce this dramatically.

### Technique 1: Prefix Sum Arrays

**Problem**: Answer multiple range sum queries efficiently.

**Naive Approach**: O(n) per query - iterate and sum each time
**Optimized**: O(1) per query after O(n) preprocessing

```python
class RangeSumQuery:
    """
    Preprocess array for O(1) range sum queries.
    
    Build Time: O(n)
    Query Time: O(1)
    Space: O(n)
    """
    
    def __init__(self, nums):
        """Build prefix sum array."""
        n = len(nums)
        self.prefix = [0] * (n + 1)
        
        # prefix[i] = sum of nums[0..i-1]
        for i in range(n):
            self.prefix[i + 1] = self.prefix[i] + nums[i]
    
    def range_sum(self, left, right):
        """
        Sum of elements from left to right (inclusive).
        
        Math: sum[left..right] = prefix[right+1] - prefix[left]
        """
        return self.prefix[right + 1] - self.prefix[left]

# Example: Stock price changes
price_changes = [2, -1, 3, -2, 1]
rsq = RangeSumQuery(price_changes)

print(rsq.range_sum(1, 3))  # -1 + 3 + -2 = 0
print(rsq.range_sum(0, 4))  # Total change = 3
```

- **Applications**

    - Subarray sum problems
    - Image processing (summed-area tables)
    - Database query optimization
    - Cumulative statistics

### Technique 2: Sparse Table (Range Minimum/Maximum Query)

**Problem**: Answer range min/max queries where array doesn't change.

**Approach**: Precompute answers for all ranges of size 2^k

```python
import math

class SparseTable:
    """
    Range minimum query using sparse table.
    
    Build Time: O(n log n)
    Query Time: O(1)
    Space: O(n log n)
    
    Perfect for static arrays with many queries.
    """
    
    def __init__(self, arr):
        n = len(arr)
        if n == 0:
            self.table = []
            self.log_table = []
            return
        
        # Max power of 2 we need
        max_log = int(math.log2(n)) + 1
        
        # table[i][j] = min in range [i, i + 2^j - 1]
        self.table = [[0] * max_log for _ in range(n)]
        
        # Base case: ranges of length 1
        for i in range(n):
            self.table[i][0] = arr[i]
        
        # Fill table for ranges of length 2^j
        for j in range(1, max_log):
            i = 0
            while i + (1 << j) <= n:
                # Range [i, i + 2^j - 1] = 
                # min of [i, i + 2^(j-1) - 1] and [i + 2^(j-1), i + 2^j - 1]
                left = self.table[i][j - 1]
                right = self.table[i + (1 << (j - 1))][j - 1]
                self.table[i][j] = min(left, right)
                i += 1
        
        # Precompute log values for O(1) query
        self.log_table = [0] * (n + 1)
        for i in range(2, n + 1):
            self.log_table[i] = self.log_table[i // 2] + 1
    
    def range_min(self, left, right):
        """
        Minimum in range [left, right].
        
        Key insight: Any range can be covered by two
        (possibly overlapping) power-of-2 ranges.
        """
        if not self.table:
            return None
        
        # Find largest power of 2 that fits in range
        length = right - left + 1
        j = self.log_table[length]
        
        # Cover range with two (possibly overlapping) blocks
        left_min = self.table[left][j]
        right_min = self.table[right - (1 << j) + 1][j]
        
        return min(left_min, right_min)

# Example: Stock prices - find minimum in any date range
prices = [100, 80, 120, 70, 110, 90]
st = SparseTable(prices)

print(f"Min price days 1-4: ${st.range_min(1, 4)}")  # 70
print(f"Min price days 0-2: ${st.range_min(0, 2)}")  # 80
print(f"Min price all days: ${st.range_min(0, 5)}")  # 70
```

- **When to Use Sparse Table**

    - Array is static (no updates between queries)
    - Need O(1) query time
    - Many queries on same array
    - Idempotent operations (min, max, GCD) - not sum!

### Technique 3: Difference Array (Range Updates)

**Problem**: Apply updates to ranges efficiently.

```python
class RangeUpdateArray:
    """
    Efficiently apply multiple range updates.
    
    Build: O(n)
    Update: O(1) per update
    Finalize: O(n) to get final array
    
    Perfect when you have many updates before needing final values.
    """
    
    def __init__(self, size):
        # Difference array: diff[i] = arr[i] - arr[i-1]
        self.diff = [0] * (size + 1)
        self.size = size
    
    def range_add(self, left, right, val):
        """Add val to all elements in range [left, right]."""
        self.diff[left] += val
        self.diff[right + 1] -= val
    
    def get_array(self):
        """Reconstruct final array from difference array."""
        result = [0] * self.size
        current = 0
        
        for i in range(self.size):
            current += self.diff[i]
            result[i] = current
        
        return result

# Example: Event scheduling with overlapping events
schedule = RangeUpdateArray(10)  # 10 time slots

# Event 1: slots 0-3
schedule.range_add(0, 3, 1)
# Event 2: slots 2-5
schedule.range_add(2, 5, 1)
# Event 3: slots 4-7
schedule.range_add(4, 7, 1)

load = schedule.get_array()
print("Concurrent events per slot:", load)
# [1, 1, 2, 2, 3, 3, 2, 2, 0, 0]
print(f"Max concurrent events: {max(load)}")  # 3
```

- **Applications**

    - Calendar applications (booking conflicts)
    - Network bandwidth allocation
    - Task scheduling
    - Image filters (box blur)

## Five Data Structures for Image Processing

Image processing relies heavily on efficient array operations. Understanding these structures is crucial for computer vision and graphics.

### 1. 2D Arrays (Pixel Matrices)

**Core Structure**: Images are 2D arrays where each element represents a pixel.

```python
# Grayscale image: 2D array of intensity values (0-255)
grayscale = [
    [100, 120, 130],
    [110, 125, 135],
    [115, 130, 140]
]

# RGB image: 3D array (height, width, channels)
rgb_image = [
    [[255, 0, 0], [0, 255, 0]],    # Row 1: Red, Green
    [[0, 0, 255], [255, 255, 0]]   # Row 2: Blue, Yellow
]

def get_pixel(image, row, col):
    """Access pixel with bounds checking."""
    if 0 <= row < len(image) and 0 <= col < len(image[0]):
        return image[row][col]
    return None  # Out of bounds
```

### 2. Summed-Area Tables (Integral Images)

**Purpose**: Calculate sum of any rectangular region in O(1).

```python
def build_summed_area_table(image):
    """
    Build integral image for fast region queries.
    
    Time: O(rows * cols)
    Query: O(1)
    """
    rows, cols = len(image), len(image[0])
    sat = [[0] * (cols + 1) for _ in range(rows + 1)]
    
    for i in range(rows):
        for j in range(cols):
            sat[i + 1][j + 1] = (
                image[i][j] +
                sat[i][j + 1] +      # Left
                sat[i + 1][j] -      # Top
                sat[i][j]            # Overlap correction
            )
    
    return sat

def region_sum(sat, r1, c1, r2, c2):
    """
    Sum of rectangle from (r1,c1) to (r2,c2).
    
    Uses inclusion-exclusion principle.
    """
    return (
        sat[r2 + 1][c2 + 1] -
        sat[r1][c2 + 1] -
        sat[r2 + 1][c1] +
        sat[r1][c1]
    )

# Example: Fast box blur
image = [
    [10, 20, 30],
    [40, 50, 60],
    [70, 80, 90]
]

sat = build_summed_area_table(image)
# Average of 2x2 region (0,0) to (1,1)
total = region_sum(sat, 0, 0, 1, 1)
avg = total // 4
print(f"Average: {avg}")  # (10+20+40+50)/4 = 30
```

- **Applications**

    - Fast box blur filters
    - Haar feature calculation (face detection)
    - Template matching
    - Adaptive thresholding

### 3. Convolution Kernels (Small 2D Arrays)

**Purpose**: Apply filters by sliding kernel over image.

```python
def apply_kernel(image, kernel):
    """
    Apply convolution kernel to image.
    
    Time: O(rows * cols * k_rows * k_cols)
    """
    rows, cols = len(image), len(image[0])
    k_rows, k_cols = len(kernel), len(kernel[0])
    
    # Output size (valid convolution, no padding)
    out_rows = rows - k_rows + 1
    out_cols = cols - k_cols + 1
    
    result = [[0] * out_cols for _ in range(out_rows)]
    
    for i in range(out_rows):
        for j in range(out_cols):
            # Apply kernel
            total = 0
            for ki in range(k_rows):
                for kj in range(k_cols):
                    total += image[i + ki][j + kj] * kernel[ki][kj]
            result[i][j] = total
    
    return result

# Common kernels
edge_detect = [
    [-1, -1, -1],
    [-1,  8, -1],
    [-1, -1, -1]
]

sharpen = [
    [ 0, -1,  0],
    [-1,  5, -1],
    [ 0, -1,  0]
]

gaussian_blur = [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1]
]  # Divide by 16 after applying
```

### 4. Histograms (1D Arrays for Intensity Distribution)

**Purpose**: Analyze pixel intensity distribution.

```python
def compute_histogram(image):
    """
    Build histogram of pixel intensities.
    
    Time: O(rows * cols)
    Space: O(256) for 8-bit images
    """
    histogram = [0] * 256
    
    for row in image:
        for pixel in row:
            histogram[pixel] += 1
    
    return histogram

def histogram_equalization(image):
    """
    Enhance contrast using histogram equalization.
    
    Redistributes intensities to use full range.
    """
    hist = compute_histogram(image)
    
    # Compute cumulative distribution
    cdf = [0] * 256
    cdf[0] = hist[0]
    for i in range(1, 256):
        cdf[i] = cdf[i - 1] + hist[i]
    
    # Normalize CDF
    total_pixels = sum(hist)
    cdf_normalized = [int((cdf[i] / total_pixels) * 255) for i in range(256)]
    
    # Apply mapping to image
    rows, cols = len(image), len(image[0])
    result = [[cdf_normalized[image[i][j]] for j in range(cols)] for i in range(rows)]
    
    return result
```

- **Applications**

    - Contrast enhancement
    - Thresholding (segmentation)
    - Color correction
    - Image comparison

### 5. Quadtrees (Hierarchical 2D Arrays)

**Purpose**: Efficiently represent sparse images or regions.

```python
class QuadtreeNode:
    """Node in quadtree representation of image."""
    
    def __init__(self, x, y, size, value=None):
        self.x = x  # Top-left corner
        self.y = y
        self.size = size  # Width/height (square)
        self.value = value  # None if internal node
        self.children = []  # [NW, NE, SW, SE]
    
    def is_leaf(self):
        return len(self.children) == 0

def build_quadtree(image, x, y, size, threshold=10):
    """
    Build quadtree from image region.
    
    Recursively subdivide if region variance > threshold.
    """
    # Extract region
    region = []
    for i in range(y, min(y + size, len(image))):
        for j in range(x, min(x + size, len(image[0]))):
            region.append(image[i][j])
    
    if not region:
        return None
    
    # Check if region is homogeneous
    avg = sum(region) / len(region)
    variance = sum((p - avg) ** 2 for p in region) / len(region)
    
    if variance <= threshold or size == 1:
        # Leaf node: represent entire region with average
        return QuadtreeNode(x, y, size, int(avg))
    
    # Internal node: subdivide into 4 quadrants
    node = QuadtreeNode(x, y, size)
    half = size // 2
    
    # Recursively build children
    node.children = [
        build_quadtree(image, x, y, half, threshold),              # NW
        build_quadtree(image, x + half, y, half, threshold),       # NE
        build_quadtree(image, x, y + half, half, threshold),       # SW
        build_quadtree(image, x + half, y + half, half, threshold) # SE
    ]
    
    return node

def count_nodes(node):
    """Count total nodes in quadtree."""
    if node is None:
        return 0
    if node.is_leaf():
        return 1
    return 1 + sum(count_nodes(child) for child in node.children)

# Example: Compress image with large uniform regions
# Full resolution: 256x256 = 65,536 pixels
# Quadtree: ~1,000 nodes for typical image (98.5% compression!)
```

- **Applications**

    - Image compression
    - Collision detection in games
    - Spatial indexing
    - Level-of-detail rendering

## Further Learning

The techniques and structures above provide production-ready implementations for real-world scenarios. For additional perspectives:


- **Comprehensive Array Fundamentals**: External resources may offer alternative explanations of 1D/2D/3D arrays and dynamic array implementation details
- **Advanced Range Query Optimizations**: Some resources cover additional data structures like Segment Trees and Fenwick Trees for updateable range queries
- **Image Processing Deep Dives**: Computer vision textbooks provide mathematical foundations for filters and transformations

The key is understanding *why* each structure is chosen for specific scenarios - that's more valuable than memorizing implementations.
