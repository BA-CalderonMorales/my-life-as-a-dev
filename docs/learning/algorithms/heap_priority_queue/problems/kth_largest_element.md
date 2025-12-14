# Kth Largest Element in an Array

**Difficulty**: Medium  
**LeetCode**: [#215](https://leetcode.com/problems/kth-largest-element-in-an-array/)

## Problem Statement

Find the kth largest element in an unsorted array. Note that it is the kth largest element in sorted order, not the kth distinct element.

**Example**:
```
Input: nums = [3, 2, 1, 5, 6, 4], k = 2
Output: 5
Explanation: The array sorted is [1, 2, 3, 4, 5, 6], so 2nd largest is 5
```

## Approach

Use a min heap of size k:

- Maintain k largest elements in heap
- Smallest of these k elements is at root (kth largest overall)
- When heap exceeds size k, remove smallest element

This ensures we always have k largest elements, with kth largest at top.

## Solution

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

## Step-by-Step Walkthrough

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

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
