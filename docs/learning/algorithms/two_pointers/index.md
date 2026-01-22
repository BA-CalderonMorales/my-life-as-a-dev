---
title: Two Pointers Pattern
description: Reduce O(n^2) to O(n) by using two references to traverse data structures efficiently.
---

# Two Pointers Pattern

The Two Pointers pattern uses two references to traverse a data structure from different positions or directions. This technique reduces time complexity from O(n^2) to O(n) for many problems.

<div class="grid cards" markdown>

-   :material-speedometer:{ .lg .middle } **Time Complexity**

    ---

    O(n) - single pass through the array

-   :material-memory:{ .lg .middle } **Space Complexity**

    ---

    O(1) - only pointer variables

</div>

---

## When to Use

!!! tip "Pattern Recognition"

    Look for these keywords in problem statements:

    - "Sorted array" (huge hint!)
    - "Find pair/triplet with sum"
    - "Palindrome"
    - "Partition array"
    - "Remove duplicates in place"

---

## Visual Explanation

```text
OPPOSITE ENDS (Most common)
─────────────────────────────────────────────────────────────────────

Finding pair that sums to target in sorted array:

Array: [ 1 | 2 | 3 | 4 | 6 | 8 | 9 ]   Target: 10
        ↑                       ↑
       left                   right
       
       Sum = 1 + 9 = 10  (Found!)

If sum < target: move left →
If sum > target: move right ←


SAME DIRECTION
─────────────────────────────────────────────────────────────────────

Removing duplicates from sorted array:

Array: [ 1 | 1 | 2 | 2 | 2 | 3 ]
        ↑   ↑
       slow fast

Fast explores, slow marks unique position.
When fast finds new value, copy to slow+1.


CONVERGING FROM ENDS
─────────────────────────────────────────────────────────────────────

Container With Most Water:

heights: [ 1 | 8 | 6 | 2 | 5 | 4 | 8 | 3 | 7 ]
           ↑                               ↑
          left                           right
          
Area = min(1, 7) * 8 = 8
Move shorter height inward to potentially find taller container.
```

---

## Core Variations

| Variation | Movement | Use Case |
|-----------|----------|----------|
| **Opposite Ends** | Start at both ends, move toward center | Pair sums, palindromes, container problems |
| **Same Direction** | Both move forward at different speeds | Remove duplicates, partitioning |
| **Different Speeds** | Fast/slow pointers | Cycle detection, middle element |

---

## Problem 1: Two Sum II - Sorted Array

**Difficulty**: Medium | **LeetCode**: #167

### Problem Statement

Given a sorted array, find two numbers that add up to target. Return indices (1-indexed).

```
Input: numbers = [2, 7, 11, 15], target = 9
Output: [1, 2]
```

### Solution

```python
def two_sum(numbers, target):
    """
    Time: O(n) - single pass with two pointers
    Space: O(1) - only pointer variables
    """
    left, right = 0, len(numbers) - 1
    
    while left < right:
        current_sum = numbers[left] + numbers[right]
        
        if current_sum == target:
            return [left + 1, right + 1]  # 1-indexed
        elif current_sum < target:
            left += 1   # Need larger sum
        else:
            right -= 1  # Need smaller sum
    
    return []
```

### Walkthrough

```text
numbers = [2, 7, 11, 15], target = 9

Step 1: left=0 (2), right=3 (15)
        2 + 15 = 17 > 9  →  move right

Step 2: left=0 (2), right=2 (11)
        2 + 11 = 13 > 9  →  move right

Step 3: left=0 (2), right=1 (7)
        2 + 7 = 9 = target  →  FOUND!

Result: [1, 2]
```

---

## Problem 2: Container With Most Water

**Difficulty**: Medium | **LeetCode**: #11

### Problem Statement

Find two lines that form a container holding the most water.

```
Input: height = [1, 8, 6, 2, 5, 4, 8, 3, 7]
Output: 49
```

### Solution

```python
def max_area(height):
    """
    Time: O(n) - single pass
    Space: O(1) - only pointers
    """
    left, right = 0, len(height) - 1
    max_water = 0
    
    while left < right:
        width = right - left
        h = min(height[left], height[right])
        max_water = max(max_water, width * h)
        
        # Move shorter height inward
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    
    return max_water
```

!!! question "Why move the shorter height?"

    Moving the taller height can only **decrease** area because:
    
    - Width decreases by 1
    - Height is limited by the shorter line (unchanged)
    
    Moving the shorter height **might** find a taller line, potentially increasing area.

---

## Practice Problems

| Problem | Difficulty | Key Concept | Link |
|---------|------------|-------------|------|
| Two Sum II | Medium | Opposite ends, sorted array | [Solution](problems/two_sum_sorted.md) |
| Container With Most Water | Medium | Greedy pointer movement | [Solution](problems/container_with_most_water.md) |
| 3Sum | Medium | Sort + two pointers | [LC 15](https://leetcode.com/problems/3sum/) |
| Remove Duplicates | Easy | Same direction | [LC 26](https://leetcode.com/problems/remove-duplicates-from-sorted-array/) |

---

## Key Takeaways

<div class="grid" markdown>

!!! success "Do This"

    - Sort array first if not sorted (enables two pointers)
    - Decide pointer movement based on comparison result
    - Handle duplicates explicitly if needed

!!! danger "Avoid This"

    - Using two pointers on unsorted data without sorting
    - Moving wrong pointer (think about which direction helps)
    - Forgetting edge cases (empty array, single element)

</div>

---

## LeetCode Practice

- [167. Two Sum II](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)
- [11. Container With Most Water](https://leetcode.com/problems/container-with-most-water/)
- [15. 3Sum](https://leetcode.com/problems/3sum/)
- [26. Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)
- [125. Valid Palindrome](https://leetcode.com/problems/valid-palindrome/)
  max_water = 49 (unchanged)
  heights equal, move right

Continue until left >= right...

Result: 49
```

## Problem 3: Remove Duplicates from Sorted Array

**Difficulty**: Easy  
**LeetCode**: #26

### Problem Statement

Given a sorted array, remove duplicates in-place such that each element appears only once. Return the new length.

**Example**:
```
Input: nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
Output: 5
Explanation: First 5 elements are [0, 1, 2, 3, 4]
```

### Approach

Use two pointers:

- Slow pointer: tracks position for next unique element
- Fast pointer: explores array to find unique elements
- When fast pointer finds new unique element, place it at slow pointer position

### Solution

```python
def remove_duplicates(nums):
    """
    Remove duplicates in-place from sorted array.
    
    Time Complexity: O(n) - single pass
    Space Complexity: O(1) - in-place modification
    """
    if not nums:
        return 0
    
    # Slow pointer: position for next unique element
    slow = 1
    
    # Fast pointer: explore array
    for fast in range(1, len(nums)):
        # Found new unique element
        if nums[fast] != nums[fast - 1]:
            nums[slow] = nums[fast]
            slow += 1
    
    return slow

# Alternative approach comparing with slow pointer
def remove_duplicates_alt(nums):
    """Alternative implementation."""
    if not nums:
        return 0
    
    slow = 0
    
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]
    
    return slow + 1

# Test
nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
length = remove_duplicates(nums)
print(f"Length: {length}, Array: {nums[:length]}")  
# Output: Length: 5, Array: [0, 1, 2, 3, 4]
```

### Step-by-Step Walkthrough

```
nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]

Initial: slow=1, fast=1

fast=1: nums[1]=0, nums[0]=0 → duplicate, skip
  Array: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
         slow=1

fast=2: nums[2]=1, nums[1]=0 → new unique!
  nums[slow=1] = 1
  Array: [0, 1, 1, 1, 1, 2, 2, 3, 3, 4]
         slow=2

fast=3: nums[3]=1, nums[2]=1 → duplicate, skip
  Array: [0, 1, 1, 1, 1, 2, 2, 3, 3, 4]
         slow=2

fast=4: nums[4]=1, nums[3]=1 → duplicate, skip
  Array: [0, 1, 1, 1, 1, 2, 2, 3, 3, 4]
         slow=2

fast=5: nums[5]=2, nums[4]=1 → new unique!
  nums[slow=2] = 2
  Array: [0, 1, 2, 1, 1, 2, 2, 3, 3, 4]
         slow=3

fast=6: nums[6]=2, nums[5]=2 → duplicate, skip

fast=7: nums[7]=3, nums[6]=2 → new unique!
  nums[slow=3] = 3
  Array: [0, 1, 2, 3, 1, 2, 2, 3, 3, 4]
         slow=4

fast=8: nums[8]=3, nums[7]=3 → duplicate, skip

fast=9: nums[9]=4, nums[8]=3 → new unique!
  nums[slow=4] = 4
  Array: [0, 1, 2, 3, 4, 2, 2, 3, 3, 4]
         slow=5

Result: length=5, first 5 elements are unique
```

## Key Takeaways

1. **Direction Matters**: Choose opposite or same direction based on problem
2. **Sorted Arrays**: Two pointers particularly effective with sorted data
3. **In-Place Modification**: Often used for space-efficient operations
4. **Pointer Movement Logic**: Clear rules for when to move which pointer
5. **Multiple Variations**: Adapt technique to problem requirements

## Common Patterns

### Opposite Direction
- Two sum in sorted array
- Palindrome checking
- Container problems
- Trapping rain water

### Same Direction (Fast/Slow)
- Removing duplicates
- Partitioning arrays
- Merging sorted arrays
- Move zeros to end

### Sliding Window Variant
- Window bounds maintained by two pointers
- See Sliding Window pattern for details

## Practice Tips

- Draw array and pointer positions
- Trace pointer movements step-by-step
- Consider edge cases: empty, single element, all same
- Think about when to move which pointer
- Verify invariants maintained throughout

## Common Mistakes

- Moving both pointers simultaneously when shouldn't
- Off-by-one errors in pointer updates
- Not handling edge cases properly
- Forgetting to update result before moving pointers
- Wrong condition for pointer movement

## Code Templates and Patterns

Two-pointer technique follows predictable patterns. Master these templates to solve problems faster.

### Template 1: Opposite Direction (Converging Pointers)

**Use when**: Processing from both ends toward middle.

```python
def two_pointer_opposite_template(arr):
    """
    General template for opposite-direction pointers.
    
    Time: O(n) - Each element visited once
    Space: O(1) - Only two pointers
    """
    left = 0
    right = len(arr) - 1
    
    while left < right:
        # Process current pair
        # Decision: Move which pointer?
        
        if condition_move_left(arr, left, right):
            left += 1
        elif condition_move_right(arr, left, right):
            right -= 1
        else:
            # Process and move both
            process(arr, left, right)
            left += 1
            right -= 1
    
    return result
```

**Example: Three Sum Closest**

```python
def three_sum_closest(nums, target):
    """
    Find three numbers whose sum is closest to target.
    
    Example: nums = [-1,2,1,-4], target = 1
    Output: 2 (sum of -1 + 2 + 1)
    """
    nums.sort()
    closest = float('inf')
    
    for i in range(len(nums) - 2):
        left = i + 1
        right = len(nums) - 1
        
        while left < right:
            current_sum = nums[i] + nums[left] + nums[right]
            
            # Update closest if better
            if abs(current_sum - target) < abs(closest - target):
                closest = current_sum
            
            # Move pointers based on comparison
            if current_sum < target:
                left += 1  # Need larger sum
            elif current_sum > target:
                right -= 1  # Need smaller sum
            else:
                return current_sum  # Exact match!
    
    return closest
```

### Template 2: Same Direction (Fast/Slow Pointers)

**Use when**: Processing elements with different speeds or conditions.

```python
def two_pointer_same_direction_template(arr):
    """
    General template for same-direction pointers.
    
    Slow pointer: tracks valid/processed position
    Fast pointer: explores ahead
    """
    slow = 0
    
    for fast in range(len(arr)):
        # Check if fast pointer element should be kept
        if should_keep(arr, fast):
            # Process and update slow pointer position
            arr[slow] = arr[fast]  # or process differently
            slow += 1
    
    return slow  # Often returns new length/count
```

**Example: Move Zeros**

```python
def move_zeros(nums):
    """
    Move all zeros to end while maintaining order of non-zeros.
    
    Example: [0,1,0,3,12] -> [1,3,12,0,0]
    
    Time: O(n)
    Space: O(1) - in-place
    """
    slow = 0  # Next position for non-zero
    
    # Move all non-zeros to front
    for fast in range(len(nums)):
        if nums[fast] != 0:
            nums[slow] = nums[fast]
            slow += 1
    
    # Fill rest with zeros
    while slow < len(nums):
        nums[slow] = 0
        slow += 1

# Alternative: swap instead of overwrite
def move_zeros_swap(nums):
    """Same result, different approach."""
    slow = 0
    
    for fast in range(len(nums)):
        if nums[fast] != 0:
            # Swap non-zero to slow position
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow += 1
```

### Template 3: Sliding Window (Variable Size)

**Use when**: Finding subarray/substring that satisfies condition.

```python
def sliding_window_template(arr):
    """
    Variable-size sliding window with two pointers.
    
    Left: window start
    Right: window end
    """
    left = 0
    best = None
    window_state = initialize_state()
    
    for right in range(len(arr)):
        # Expand window: include arr[right]
        update_state(window_state, arr[right])
        
        # Shrink window: while condition violated
        while not valid(window_state):
            remove_from_state(window_state, arr[left])
            left += 1
        
        # Update answer
        best = update_best(best, right - left + 1)
    
    return best
```

**Example: Longest Substring Without Repeating Characters**

```python
def length_of_longest_substring(s):
    """
    Find length of longest substring without repeating characters.
    
    Example: "abcabcbb" -> 3 ("abc")
    
    Time: O(n) - Each char enters and exits window once
    Space: O(min(n, m)) where m is charset size
    """
    char_set = set()
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        # Shrink window until no duplicates
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        
        # Add current character
        char_set.add(s[right])
        
        # Update maximum
        max_length = max(max_length, right - left + 1)
    
    return max_length
```

### Template 4: Partitioning (Dutch National Flag)

**Use when**: Partitioning array into regions.

```python
def partition_template(arr, pivot):
    """
    Partition array around pivot.
    
    < pivot | = pivot | unprocessed | > pivot
    ^left    ^mid                    ^right
    """
    left = 0   # Next position for < pivot
    mid = 0    # Current element being examined
    right = len(arr) - 1  # Next position for > pivot
    
    while mid <= right:
        if arr[mid] < pivot:
            # Belongs in left section
            arr[left], arr[mid] = arr[mid], arr[left]
            left += 1
            mid += 1
        elif arr[mid] > pivot:
            # Belongs in right section
            arr[mid], arr[right] = arr[right], arr[mid]
            right -= 1
            # Don't increment mid - check swapped element
        else:
            # Equal to pivot - stays in middle
            mid += 1
```

**Example: Sort Colors (0s, 1s, 2s)**

```python
def sort_colors(nums):
    """
    Sort array containing only 0, 1, 2.
    
    Example: [2,0,2,1,1,0] -> [0,0,1,1,2,2]
    
    Time: O(n) - Single pass
    Space: O(1) - In-place
    """
    left = 0    # Next position for 0
    mid = 0     # Current element
    right = len(nums) - 1  # Next position for 2
    
    while mid <= right:
        if nums[mid] == 0:
            nums[left], nums[mid] = nums[mid], nums[left]
            left += 1
            mid += 1
        elif nums[mid] == 2:
            nums[mid], nums[right] = nums[right], nums[mid]
            right -= 1
            # Don't increment mid!
        else:  # nums[mid] == 1
            mid += 1
```

### Decision Framework: Which Template?

```
┌─ Need to process from both ends? 
│  └─ YES → Template 1 (Opposite Direction)
│
├─ Need to filter/partition elements?
│  ├─ Two groups → Template 2 (Same Direction)
│  └─ Three groups → Template 4 (Partitioning)
│
└─ Need to find subarray/substring?
   └─ YES → Template 3 (Sliding Window)
```

### Common Optimization: Reduce O(n²) to O(n)

**Before (Brute Force)**:

```python
def container_with_most_water_brute(height):
    """
    Find max water container.
    
    Time: O(n²) - Try all pairs
    """
    max_area = 0
    for i in range(len(height)):
        for j in range(i + 1, len(height)):
            width = j - i
            h = min(height[i], height[j])
            max_area = max(max_area, width * h)
    return max_area
```

**After (Two Pointers)**:

```python
def container_with_most_water_optimal(height):
    """
    Find max water container.
    
    Time: O(n) - Single pass with two pointers
    
    Key insight: Always move pointer at shorter height
    Why? Moving taller pointer can't increase area
    (width decreases, height stays same or decreases)
    """
    left = 0
    right = len(height) - 1
    max_area = 0
    
    while left < right:
        # Calculate current area
        width = right - left
        h = min(height[left], height[right])
        max_area = max(max_area, width * h)
        
        # Move pointer at shorter height
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    
    return max_area
```

**Why it works**: Greedy choice of moving shorter pointer is optimal.

### Advanced Technique: Three Pointers

Sometimes problems need more than two pointers.

```python
def three_pointers_example(arr1, arr2, arr3):
    """
    Find common elements in three sorted arrays.
    
    Time: O(n1 + n2 + n3)
    Space: O(1)
    """
    i, j, k = 0, 0, 0
    result = []
    
    while i < len(arr1) and j < len(arr2) and k < len(arr3):
        if arr1[i] == arr2[j] == arr3[k]:
            result.append(arr1[i])
            i += 1
            j += 1
            k += 1
        else:
            # Move pointer at smallest element
            min_val = min(arr1[i], arr2[j], arr3[k])
            if arr1[i] == min_val:
                i += 1
            if arr2[j] == min_val:
                j += 1
            if arr3[k] == min_val:
                k += 1
    
    return result
```

## Further Learning

The templates and patterns above provide systematic approaches to recognize and solve two-pointer problems efficiently. For additional perspectives:


- **String-Specific Optimizations**: Some resources focus on string manipulation with two pointers
- **Advanced Variations**: Problems combining two pointers with other techniques (binary search, hash tables)
- **Practice Strategy**: Build pattern recognition through solving 20-30 problems

The key is recognizing the problem structure (opposite direction vs same direction vs sliding window) and applying the appropriate template.

## Practice on LeetCode

- [167. Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)
- [125. Valid Palindrome](https://leetcode.com/problems/valid-palindrome/)
- [15. 3Sum](https://leetcode.com/problems/3sum/)
