# Two Pointers Pattern

The Two Pointers pattern uses two references to traverse a data structure, often from different positions or directions. This technique can reduce time complexity from O(n²) to O(n) for many problems.

## When to Use Two Pointers

Use this pattern when:

- Processing sorted arrays or lists
- Finding pairs or triplets with specific properties
- Partitioning arrays based on conditions
- Comparing elements from different positions
- Problems involving palindromes or reversals

## Core Approach

### Common Variations

- **Opposite Ends**
    - Start pointers at beginning and end
    - Move toward each other based on conditions
    - Useful for: pair sums, palindromes, container problems

- **Same Direction**
    - Both pointers move forward
    - Fast pointer explores, slow pointer maintains position
    - Useful for: removing duplicates, partitioning

- **Different Speeds**
    - Pointers move at different rates
    - See Fast and Slow Pointers pattern

## Problem 1: Two Sum II - Input Array Is Sorted

**Difficulty**: Medium  
**LeetCode**: #167

### Problem Statement

Given a sorted array of integers, find two numbers that add up to a target. Return the indices (1-indexed).

**Example**:
```
Input: numbers = [2, 7, 11, 15], target = 9
Output: [1, 2]
Explanation: 2 + 7 = 9
```

### Approach

Since array is sorted:
- Start with pointers at both ends
- If sum too small, move left pointer right
- If sum too large, move right pointer left
- If sum equals target, found answer

### Solution

```python
def two_sum(numbers, target):
    """
    Find two numbers that sum to target in sorted array.
    
    Time Complexity: O(n) - single pass with two pointers
    Space Complexity: O(1) - only using pointers
    """
    left = 0
    right = len(numbers) - 1
    
    while left < right:
        current_sum = numbers[left] + numbers[right]
        
        if current_sum == target:
            return [left + 1, right + 1]  # 1-indexed
        elif current_sum < target:
            left += 1  # Need larger sum
        else:
            right -= 1  # Need smaller sum
    
    return []  # No solution found

# Test
numbers = [2, 7, 11, 15]
target = 9
print(two_sum(numbers, target))  # Output: [1, 2]
```

### Step-by-Step Walkthrough

```
numbers = [2, 7, 11, 15], target = 9

Initial: left=0 (2), right=3 (15)

Iteration 1: 2 + 15 = 17 > 9
  Sum too large, move right left
  right = 2

Iteration 2: left=0 (2), right=2 (11)
  2 + 11 = 13 > 9
  Sum too large, move right left
  right = 1

Iteration 3: left=0 (2), right=1 (7)
  2 + 7 = 9 = target ✓
  Found answer!

Result: [1, 2] (1-indexed)
```

## Problem 2: Container With Most Water

**Difficulty**: Medium  
**LeetCode**: #11

### Problem Statement

Given an array of heights representing vertical lines, find two lines that together with x-axis form a container that holds the most water.

**Example**:
```
Input: height = [1, 8, 6, 2, 5, 4, 8, 3, 7]
Output: 49
Explanation: Container formed by heights at index 1 and 8 (8 and 7)
```

### Approach

Water capacity = min(height[left], height[right]) * (right - left)

Strategy:
- Start with widest container (pointers at ends)
- Move pointer with shorter height inward
- Track maximum area seen

Why move shorter height? Moving taller height can only decrease area (width decreases, height can't increase past shorter one).

### Solution

```python
def max_area(height):
    """
    Find maximum water container area.
    
    Time Complexity: O(n) - single pass
    Space Complexity: O(1) - only pointers
    """
    left = 0
    right = len(height) - 1
    max_water = 0
    
    while left < right:
        # Calculate current area
        width = right - left
        current_height = min(height[left], height[right])
        current_area = width * current_height
        max_water = max(max_water, current_area)
        
        # Move pointer with shorter height
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    
    return max_water

# Test
height = [1, 8, 6, 2, 5, 4, 8, 3, 7]
print(max_area(height))  # Output: 49
```

### Step-by-Step Walkthrough

```
height = [1, 8, 6, 2, 5, 4, 8, 3, 7]
         [0, 1, 2, 3, 4, 5, 6, 7, 8]

left=0 (h=1), right=8 (h=7):
  area = min(1, 7) * 8 = 1 * 8 = 8
  max_water = 8
  height[left] < height[right], move left

left=1 (h=8), right=8 (h=7):
  area = min(8, 7) * 7 = 7 * 7 = 49
  max_water = 49
  height[left] > height[right], move right

left=1 (h=8), right=7 (h=3):
  area = min(8, 3) * 6 = 3 * 6 = 18
  max_water = 49 (unchanged)
  height[left] > height[right], move right

left=1 (h=8), right=6 (h=8):
  area = min(8, 8) * 5 = 8 * 5 = 40
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
