# Longest Substring Without Repeating Characters

**Difficulty**: Medium  
**LeetCode**: [#3](https://leetcode.com/problems/longest-substring-without-repeating-characters/)

## Problem Statement

Given a string, find the length of the longest substring without repeating characters.

**Example**:
```
Input: s = "abcabcbb"
Output: 3
Explanation: "abc" is the longest substring without repeats
```

## Approach

This is a variable-size sliding window problem:

1. Use a set to track characters in current window
2. Expand window by adding characters from right
3. If duplicate found, contract window from left until duplicate removed
4. Track maximum window size

## Solution

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

## Step-by-Step Walkthrough

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

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
