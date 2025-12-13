# Sliding Window Pattern

The sliding window pattern is a powerful technique for solving problems involving contiguous sequences within arrays or strings. It optimizes brute force approaches from O(n²) to O(n) by maintaining a "window" that slides through the data.

## When to Use Sliding Window

Use this pattern when you need to:

- Find optimal contiguous subarrays or substrings
- Track elements within a fixed or variable window size
- Aggregate data over ranges efficiently
- Minimize or maximize values in sequences

## Core Approach

The sliding window technique involves:

1. **Initialize Window**: Start with a window at the beginning of the array
2. **Expand Window**: Grow the window by moving the right boundary
3. **Process Window**: Update aggregates or check conditions
4. **Contract Window**: Shrink from the left when conditions are met or violated
5. **Track Result**: Maintain the best result found so far

### Two Main Types

**Fixed-Size Window**: Window size remains constant throughout
- Move both pointers together
- Simple implementation

**Variable-Size Window**: Window expands and contracts based on conditions
- Expand right pointer to grow window
- Contract left pointer to shrink window
- More complex but handles dynamic constraints

## Problem 1: Maximum Sum Subarray of Size K

**Difficulty**: Easy  
**LeetCode**: Similar to #643 (Maximum Average Subarray I)

### Problem Statement

Given an array of integers and a number k, find the maximum sum of any contiguous subarray of size k.

**Example**:
```
Input: arr = [2, 1, 5, 1, 3, 2], k = 3
Output: 9
Explanation: Subarray [5, 1, 3] has maximum sum of 9
```

### Approach

This is a classic fixed-size sliding window problem:

1. Calculate sum of first k elements (initial window)
2. Slide window one position at a time
3. Remove leftmost element, add new rightmost element
4. Track maximum sum seen

### Solution

```python
def max_sum_subarray(arr, k):
    """
    Find maximum sum of any subarray of size k.
    
    Time Complexity: O(n) - single pass through array
    Space Complexity: O(1) - only tracking window sum and max
    """
    if not arr or len(arr) < k:
        return 0
    
    # Calculate sum of first window
    window_sum = sum(arr[:k])
    max_sum = window_sum
    
    # Slide window through rest of array
    for i in range(k, len(arr)):
        # Add new element, remove old element
        window_sum = window_sum + arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
    
    return max_sum

# Test
arr = [2, 1, 5, 1, 3, 2]
k = 3
print(max_sum_subarray(arr, k))  # Output: 9
```

### Step-by-Step Walkthrough

```
arr = [2, 1, 5, 1, 3, 2], k = 3

Initial window [2, 1, 5]:
  window_sum = 2 + 1 + 5 = 8
  max_sum = 8

Slide to [1, 5, 1]:
  window_sum = 8 + 1 - 2 = 7
  max_sum = 8 (unchanged)

Slide to [5, 1, 3]:
  window_sum = 7 + 3 - 1 = 9
  max_sum = 9 (updated)

Slide to [1, 3, 2]:
  window_sum = 9 + 2 - 5 = 6
  max_sum = 9 (unchanged)

Result: 9
```

## Problem 2: Longest Substring Without Repeating Characters

**Difficulty**: Medium  
**LeetCode**: #3

### Problem Statement

Given a string, find the length of the longest substring without repeating characters.

**Example**:
```
Input: s = "abcabcbb"
Output: 3
Explanation: "abc" is the longest substring without repeats
```

### Approach

This is a variable-size sliding window problem:

1. Use a set to track characters in current window
2. Expand window by adding characters from right
3. If duplicate found, contract window from left until duplicate removed
4. Track maximum window size

### Solution

```python
def length_of_longest_substring(s):
    """
    Find length of longest substring without repeating characters.
    
    Time Complexity: O(n) - each character visited at most twice
    Space Complexity: O(min(n, m)) - m is size of character set
    """
    char_set = set()
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        # Contract window until no duplicate
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        
        # Add current character and update max
        char_set.add(s[right])
        max_length = max(max_length, right - left + 1)
    
    return max_length

# Test
s = "abcabcbb"
print(length_of_longest_substring(s))  # Output: 3
```

### Step-by-Step Walkthrough

```
s = "abcabcbb"

i=0, char='a': set={a}, window="a", max_len=1
i=1, char='b': set={a,b}, window="ab", max_len=2
i=2, char='c': set={a,b,c}, window="abc", max_len=3
i=3, char='a': 
  - 'a' in set, remove s[0]='a', left=1
  - set={b,c}, add 'a'
  - set={b,c,a}, window="bca", max_len=3
i=4, char='b':
  - 'b' in set, remove s[1]='b', left=2
  - set={c,a}, add 'b'
  - set={c,a,b}, window="cab", max_len=3
i=5, char='c':
  - 'c' in set, remove s[2]='c', left=3
  - set={a,b}, add 'c'
  - set={a,b,c}, window="abc", max_len=3
i=6, char='b':
  - 'b' in set, remove s[3]='a', left=4
  - 'b' still in set, remove s[4]='b', left=5
  - set={c}, add 'b'
  - set={c,b}, window="cb", max_len=3
i=7, char='b':
  - 'b' in set, remove s[5]='c', left=6
  - 'b' still in set, remove s[6]='b', left=7
  - set={}, add 'b'
  - set={b}, window="b", max_len=3

Result: 3
```

## Problem 3: Minimum Window Substring

**Difficulty**: Hard  
**LeetCode**: #76

### Problem Statement

Given two strings s and t, find the minimum window in s which contains all characters of t.

**Example**:
```
Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
Explanation: "BANC" is the smallest substring containing all of "ABC"
```

### Approach

This is an advanced variable-size sliding window:

1. Use frequency maps to track required characters and window characters
2. Expand window until all required characters are present
3. Contract window while maintaining all required characters
4. Track minimum window that satisfies conditions

### Solution

```python
from collections import Counter

def min_window(s, t):
    """
    Find minimum window in s containing all characters of t.
    
    Time Complexity: O(|s| + |t|) - linear scan
    Space Complexity: O(|s| + |t|) - for frequency maps
    """
    if not s or not t:
        return ""
    
    # Frequency of characters in t
    target_count = Counter(t)
    required = len(target_count)
    
    # Sliding window
    left = 0
    formed = 0  # Count of unique chars in window matching target
    window_count = {}
    
    # Result tracking: (window_length, left, right)
    result = float("inf"), None, None
    
    for right in range(len(s)):
        # Add character from right
        char = s[right]
        window_count[char] = window_count.get(char, 0) + 1
        
        # Check if frequency matches
        if char in target_count and window_count[char] == target_count[char]:
            formed += 1
        
        # Contract window while valid
        while left <= right and formed == required:
            char = s[left]
            
            # Update result if smaller window found
            if right - left + 1 < result[0]:
                result = (right - left + 1, left, right)
            
            # Remove character from left
            window_count[char] -= 1
            if char in target_count and window_count[char] < target_count[char]:
                formed -= 1
            
            left += 1
    
    return "" if result[0] == float("inf") else s[result[1]:result[2] + 1]

# Test
s = "ADOBECODEBANC"
t = "ABC"
print(min_window(s, t))  # Output: "BANC"
```

### Step-by-Step Walkthrough

```
s = "ADOBECODEBANC", t = "ABC"
target_count = {'A': 1, 'B': 1, 'C': 1}, required = 3

Expand window:
window="A": formed=1, not all chars
window="AD": formed=1
window="ADO": formed=1
window="ADOB": formed=2 (have B)
window="ADOBE": formed=2
window="ADOBEC": formed=3 (have all!) -> result="ADOBEC" (length 6)

Contract window while valid:
window="DOBEC": formed=2 (lost A)

Continue expanding:
window="DOBECO": formed=2
window="DOBECOD": formed=2
window="DOBECODE": formed=2
window="DOBECODEB": formed=3 (have all!) -> result="DOBECODEB" (length 9, worse)

Contract:
window="OBECODEB": formed=2 (lost D)
Continue to window="BECODEBA": formed=3 (have all!) -> result unchanged

Contract:
window="ECODEBA": formed=2 (lost B)
Continue to window="ECODEBAN": formed=2
window="ECODEBANC": formed=3 (have all!) -> result unchanged

Contract repeatedly:
window="CODEBANC": formed=2 (lost E)
Continue expanding (already at end)
window="BANC": formed=3 -> result="BANC" (length 4, best!)

Result: "BANC"
```

## Key Takeaways

1. **Fixed vs Variable Windows**: Choose based on whether size is constant
2. **Efficient Updates**: Add/remove elements in O(1) while sliding
3. **Tracking State**: Use appropriate data structures (set, map, counter)
4. **Two Pointers**: Left for contraction, right for expansion
5. **Condition Checking**: Know when to expand vs contract the window

## Practice Tips

- Start with fixed-size window problems
- Draw the window movement on paper
- Track what happens at each step
- Implement helper functions for clarity
- Consider edge cases: empty input, k > length, all same elements

## Common Variations

- Maximum/minimum sum of size k
- Subarrays with specific sum
- Longest substring with k distinct characters
- Finding anagrams in strings
- Container with most water (two pointers variant)

## Practice on LeetCode

- [3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)
- [1004. Max Consecutive Ones III](https://leetcode.com/problems/max-consecutive-ones-iii/)
- [209. Minimum Size Subarray Sum](https://leetcode.com/problems/minimum-size-subarray-sum/)
