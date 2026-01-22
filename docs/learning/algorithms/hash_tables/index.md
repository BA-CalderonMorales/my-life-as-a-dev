---
tags:
  - Data Structures
  - Algorithms
  - Interview
---

# Hash Tables and Sets

Hash tables and sets are fundamental data structures that provide fast lookups, insertions, and deletions. They are essential tools for solving a wide range of algorithmic problems efficiently.

## What Are Hash Tables?

A hash table (also called hash map or dictionary) is a data structure that maps keys to values using a hash function. It provides average O(1) time complexity for basic operations.

### Key Concepts

**Hash Function**: Converts keys into array indices

- Should be deterministic (same key always produces same hash)
- Should distribute keys uniformly across the table
- Should be fast to compute

**Collision Handling**: When two keys hash to the same index

- Chaining: Store multiple items at same index using linked lists
- Open Addressing: Find another empty slot (linear probing, quadratic probing)

## Hash Tables in Python

Python provides dictionary (`dict`) as a built-in hash table implementation.

```python
# Creating hash tables
hash_map = {}
hash_map = dict()

# Basic operations
hash_map['key'] = 'value'  # Insert/Update: O(1) average
value = hash_map['key']    # Access: O(1) average
del hash_map['key']        # Delete: O(1) average

# Check existence
if 'key' in hash_map:      # O(1) average
    print("Key exists")

# Get with default
value = hash_map.get('key', default_value)

# Iterate
for key in hash_map:
    print(key, hash_map[key])

for key, value in hash_map.items():
    print(key, value)
```

## Sets

A set is a collection of unique elements with fast membership testing. It's essentially a hash table without values.

```python
# Creating sets
my_set = set()
my_set = {1, 2, 3}

# Basic operations
my_set.add(4)           # Insert: O(1) average
my_set.remove(2)        # Delete: O(1) average
my_set.discard(5)       # Delete if exists (no error)

# Check membership
if 3 in my_set:         # O(1) average
    print("Element exists")

# Set operations
set1 = {1, 2, 3}
set2 = {3, 4, 5}

union = set1 | set2           # {1, 2, 3, 4, 5}
intersection = set1 & set2    # {3}
difference = set1 - set2      # {1, 2}
symmetric_diff = set1 ^ set2  # {1, 2, 4, 5}
```

## Common Patterns

### Frequency Counting

Count occurrences of elements.

```python
def count_frequencies(arr):
    """Count frequency of each element."""
    freq = {}
    for num in arr:
        freq[num] = freq.get(num, 0) + 1
    return freq

# Example
arr = [1, 2, 2, 3, 3, 3]
print(count_frequencies(arr))  # {1: 1, 2: 2, 3: 3}
```

### Finding Duplicates

Detect duplicate elements efficiently.

```python
def has_duplicates(arr):
    """Check if array contains duplicates."""
    seen = set()
    for num in arr:
        if num in seen:
            return True
        seen.add(num)
    return False

def find_all_duplicates(arr):
    """Find all duplicate elements."""
    seen = set()
    duplicates = set()
    
    for num in arr:
        if num in seen:
            duplicates.add(num)
        else:
            seen.add(num)
    
    return list(duplicates)
```

### Two Sum Problem

Find two numbers that add up to a target.

```python
def two_sum(nums, target):
    """
    Find indices of two numbers that add up to target.
    
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    seen = {}  # value -> index
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    
    return []

# Example
nums = [2, 7, 11, 15]
target = 9
print(two_sum(nums, target))  # [0, 1]
```

### Grouping Elements

Group elements by a key.

```python
def group_anagrams(words):
    """
    Group words that are anagrams of each other.
    
    Time Complexity: O(n * k log k) where k is max word length
    Space Complexity: O(n * k)
    """
    groups = {}
    
    for word in words:
        # Use sorted word as key
        key = ''.join(sorted(word))
        if key not in groups:
            groups[key] = []
        groups[key].append(word)
    
    return list(groups.values())

# Example
words = ["eat", "tea", "tan", "ate", "nat", "bat"]
print(group_anagrams(words))
# [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
```

### Caching and Memoization

Store computed results for reuse.

```python
def fibonacci_memo(n, memo=None):
    """
    Compute fibonacci with memoization.
    
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    if memo is None:
        memo = {}
    
    if n in memo:
        return memo[n]
    
    if n <= 1:
        return n
    
    memo[n] = fibonacci_memo(n - 1, memo) + fibonacci_memo(n - 2, memo)
    return memo[n]

# Using Python's functools
from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci_cached(n):
    """Fibonacci with automatic caching."""
    if n <= 1:
        return n
    return fibonacci_cached(n - 1) + fibonacci_cached(n - 2)
```

## Advanced Techniques

### Default Dictionary

Automatically initialize missing keys.

```python
from collections import defaultdict

# Auto-initialize with list
graph = defaultdict(list)
graph[1].append(2)  # No need to check if key exists

# Auto-initialize with int (useful for counting)
counter = defaultdict(int)
for item in items:
    counter[item] += 1  # No need to check if key exists

# Auto-initialize with set
groups = defaultdict(set)
groups['category'].add('item')
```

### Counter

Specialized dict for counting.

```python
from collections import Counter

# Count elements
arr = [1, 2, 2, 3, 3, 3]
counter = Counter(arr)
print(counter)  # Counter({3: 3, 2: 2, 1: 1})

# Most common elements
print(counter.most_common(2))  # [(3, 3), (2, 2)]

# Arithmetic operations
counter1 = Counter(['a', 'b', 'c'])
counter2 = Counter(['b', 'c', 'd'])
print(counter1 + counter2)  # Counter({'b': 2, 'c': 2, 'a': 1, 'd': 1})
```

### Ordered Dictionary

Maintains insertion order (Python 3.7+ dicts are ordered by default).

```python
from collections import OrderedDict

# Maintain insertion order
ordered = OrderedDict()
ordered['first'] = 1
ordered['second'] = 2
ordered['third'] = 3

# Move to end
ordered.move_to_end('first')

# Pop in FIFO order
key, value = ordered.popitem(last=False)
```

## Problem Examples

### Problem 1: Contains Duplicate

Check if array contains any duplicates.

```python
def contains_duplicate(nums):
    """
    Check if array contains duplicates.
    
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    return len(nums) != len(set(nums))

# Alternative: Early termination
def contains_duplicate_early(nums):
    """Check with early termination."""
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False
```

### Problem 2: First Unique Character

Find first non-repeating character.

```python
def first_unique_char(s):
    """
    Find index of first unique character.
    
    Time Complexity: O(n)
    Space Complexity: O(1) - at most 26 letters
    """
    # Count frequencies
    freq = {}
    for char in s:
        freq[char] = freq.get(char, 0) + 1
    
    # Find first unique
    for i, char in enumerate(s):
        if freq[char] == 1:
            return i
    
    return -1
```

### Problem 3: Longest Consecutive Sequence

Find length of longest consecutive sequence.

```python
def longest_consecutive(nums):
    """
    Find longest consecutive sequence length.
    
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    if not nums:
        return 0
    
    num_set = set(nums)
    max_length = 0
    
    for num in num_set:
        # Only start counting from sequence starts
        if num - 1 not in num_set:
            current = num
            length = 1
            
            while current + 1 in num_set:
                current += 1
                length += 1
            
            max_length = max(max_length, length)
    
    return max_length

# Example
nums = [100, 4, 200, 1, 3, 2]
print(longest_consecutive(nums))  # 4 (sequence: 1, 2, 3, 4)
```

## Performance Characteristics

| Operation | Average Case | Worst Case |
|-----------|-------------|------------|
| Insert | O(1) | O(n) |
| Delete | O(1) | O(n) |
| Search | O(1) | O(n) |
| Space | O(n) | O(n) |

**Note**: Worst case occurs with many collisions. Good hash functions make this rare.

## When to Use Hash Tables vs Sets

**Use Hash Table (Dict) when:**

- Need to map keys to values
- Need to store associated data with keys
- Implementing caching or memoization
- Grouping or categorizing data

**Use Set when:**

- Only need to track existence (no associated values)
- Need set operations (union, intersection, difference)
- Removing duplicates
- Membership testing

## Common Applications

### Algorithm Optimization
- Reducing time complexity from O(n²) to O(n)
- Two sum, three sum variations
- Substring/subarray problems

### Data Processing
- Frequency analysis
- Grouping and categorization
- Deduplication

### Caching
- Memoization in dynamic programming
- Result caching
- LRU cache implementation

### Graph Algorithms
- Visited node tracking
- Adjacency list representation
- Cycle detection

## Practice Tips

- Think about what you need to look up quickly
- Consider using set when you don't need values
- Remember average O(1) operations make many O(n²) problems O(n)
- Use Counter for frequency counting problems
- Use defaultdict to simplify initialization logic
- Consider memory trade-offs: hash tables use extra space

## Common Mistakes

- Forgetting hash tables use extra space
- Not considering collision handling in worst case
- Using unhashable types as keys (lists, dicts)
- Modifying keys after insertion (use immutable types)
- Not handling key existence before access (use `.get()` or `in`)
- Assuming ordering in regular dicts (Python < 3.7)
- Not considering hash function quality for custom objects

## Interview Problem Patterns with Hash Tables

Hash tables transform many O(n²) brute force solutions into O(n) optimal solutions. Here are the essential patterns.

### Pattern 1: Frequency/Count Tracking

**When to use**: Need to count occurrences or track presence.

```python
def find_anagrams(s, p):
    """
    Find all anagram starting indices of p in s.
    
    Example: s = "cbaebabacd", p = "abc"
    Output: [0, 6] - "cba" and "bac" are anagrams
    
    Time: O(n) - One pass with sliding window
    Space: O(1) - At most 26 letters
    """
    from collections import Counter
    
    if len(p) > len(s):
        return []
    
    # Target frequency map
    p_count = Counter(p)
    window_count = Counter()
    
    result = []
    
    # Sliding window
    for i in range(len(s)):
        # Add new character to window
        window_count[s[i]] += 1
        
        # Remove character that left window
        if i >= len(p):
            if window_count[s[i - len(p)]] == 1:
                del window_count[s[i - len(p)]]
            else:
                window_count[s[i - len(p)]] -= 1
        
        # Check if window is anagram
        if window_count == p_count:
            result.append(i - len(p) + 1)
    
    return result
```

**Key insight**: Hash table makes comparison O(1) instead of O(k) sorting.

### Pattern 2: Complement Finding

**When to use**: Need to find pairs that satisfy a condition.

```python
def three_sum(nums):
    """
    Find all unique triplets that sum to zero.
    
    Example: [-1, 0, 1, 2, -1, -4]
    Output: [[-1, -1, 2], [-1, 0, 1]]
    
    Time: O(n²) - O(n²) worst vs O(n³) brute force
    Space: O(n) - Hash table for seen values
    """
    nums.sort()
    result = []
    
    for i in range(len(nums) - 2):
        # Skip duplicates
        if i > 0 and nums[i] == nums[i-1]:
            continue
        
        # Two sum on remaining array
        seen = set()
        target = -nums[i]
        
        for j in range(i + 1, len(nums)):
            complement = target - nums[j]
            
            if complement in seen:
                triplet = [nums[i], complement, nums[j]]
                result.append(triplet)
                
                # Skip duplicates
                while j + 1 < len(nums) and nums[j] == nums[j+1]:
                    j += 1
            
            seen.add(nums[j])
    
    return result
```

- **Alternative approaches**

    - Brute force: O(n³) - try all triplets
    - Hash table: O(n²) - fix one, two-sum on rest
    - Two pointers: O(n²) - same complexity but O(1) space

### Pattern 3: Grouping/Categorization

**When to use**: Need to group elements by computed property.

```python
def group_shifted_strings(strings):
    """
    Group strings that are shifts of each other.
    
    Example: ["abc", "bcd", "xyz", "az", "ba"]
    Output: [["abc","bcd","xyz"], ["az","ba"]]
    
    "abc" -> "bcd": shift each char by 1
    "abc" -> "xyz": shift each char by 23
    
    Time: O(n * k) where k is max string length
    Space: O(n * k)
    """
    from collections import defaultdict
    
    def get_pattern(s):
        """
        Compute shift pattern (differences between adjacent chars).
        
        "abc": (1, 1) - b-a=1, c-b=1
        "bcd": (1, 1) - same pattern!
        "az": (25,) - z-a=25 (wraps around)
        "ba": (25,) - same pattern!
        """
        if not s:
            return ()
        
        pattern = []
        for i in range(1, len(s)):
            diff = (ord(s[i]) - ord(s[i-1])) % 26
            pattern.append(diff)
        
        return tuple(pattern)
    
    groups = defaultdict(list)
    
    for string in strings:
        pattern = get_pattern(string)
        groups[pattern].append(string)
    
    return list(groups.values())
```

**Key insight**: Hash on computed property, not original value.

### Pattern 4: Sliding Window with Constraints

**When to use**: Need to maintain a window that satisfies condition.

```python
def longest_substring_k_distinct(s, k):
    """
    Longest substring with at most k distinct characters.
    
    Example: s = "eceba", k = 2
    Output: 3 ("ece" or "eba")
    
    Time: O(n) - Each char visited at most twice
    Space: O(k) - At most k+1 entries in map
    """
    if k == 0:
        return 0
    
    char_count = {}
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        # Expand window: add right character
        char_count[s[right]] = char_count.get(s[right], 0) + 1
        
        # Shrink window: too many distinct characters
        while len(char_count) > k:
            char_count[s[left]] -= 1
            if char_count[s[left]] == 0:
                del char_count[s[left]]
            left += 1
        
        # Update maximum
        max_length = max(max_length, right - left + 1)
    
    return max_length
```

**Hash table advantage**: O(1) distinct count vs O(k) with array.

### Pattern 5: LRU Cache Implementation

**When to use**: Need to track recently used items with fast access and eviction.

```python
class LRUCache:
    """
    Least Recently Used cache with O(1) operations.
    
    Combines hash table + doubly linked list:
    - Hash table: O(1) key lookup
    - Linked list: O(1) move to front / eviction
    """
    
    class Node:
        def __init__(self, key=0, value=0):
            self.key = key
            self.value = value
            self.prev = None
            self.next = None
    
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}  # key -> node
        
        # Dummy head and tail for easier insertion/deletion
        self.head = self.Node()
        self.tail = self.Node()
        self.head.next = self.tail
        self.tail.prev = self.head
    
    def _add_to_front(self, node):
        """Add node right after head."""
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node
    
    def _remove_node(self, node):
        """Remove node from linked list."""
        node.prev.next = node.next
        node.next.prev = node.prev
    
    def get(self, key):
        """
        Get value by key. Mark as recently used.
        
        Time: O(1)
        """
        if key not in self.cache:
            return -1
        
        node = self.cache[key]
        
        # Move to front (most recently used)
        self._remove_node(node)
        self._add_to_front(node)
        
        return node.value
    
    def put(self, key, value):
        """
        Add or update key-value pair.
        
        Time: O(1)
        """
        if key in self.cache:
            # Update existing
            node = self.cache[key]
            node.value = value
            
            # Move to front
            self._remove_node(node)
            self._add_to_front(node)
        else:
            # Add new
            node = self.Node(key, value)
            self.cache[key] = node
            self._add_to_front(node)
            
            # Evict if over capacity
            if len(self.cache) > self.capacity:
                # Remove least recently used (node before tail)
                lru = self.tail.prev
                self._remove_node(lru)
                del self.cache[lru.key]

# Example usage
cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))    # 1
cache.put(3, 3)        # Evicts key 2
print(cache.get(2))    # -1 (not found)
```

- **Why this works**

    - Hash table: O(1) lookup of nodes
    - Doubly linked list: O(1) move to front and eviction
    - Best of both worlds: Fast access + efficient eviction

### Pattern 6: Prefix Sum with Hash Table

**When to use**: Need to find subarrays with specific sum.

```python
def subarray_sum_equals_k(nums, k):
    """
    Count subarrays with sum equal to k.
    
    Example: nums = [1, 2, 3], k = 3
    Output: 2 - subarrays [1,2] and [3]
    
    Time: O(n) - One pass
    Space: O(n) - Prefix sum counts
    """
    # Hash table: prefix_sum -> count
    prefix_counts = {0: 1}  # Empty subarray has sum 0
    
    current_sum = 0
    count = 0
    
    for num in nums:
        current_sum += num
        
        # Check if (current_sum - k) exists
        # If yes, found subarray(s) with sum k
        if current_sum - k in prefix_counts:
            count += prefix_counts[current_sum - k]
        
        # Record current prefix sum
        prefix_counts[current_sum] = prefix_counts.get(current_sum, 0) + 1
    
    return count

# How it works:
# If prefix_sum[i] - prefix_sum[j] = k
# Then sum(nums[j+1:i+1]) = k
# So we look for: prefix_sum[j] = prefix_sum[i] - k
```

**Key insight**: Convert subarray problem to prefix sum lookup.

### Time-Space Trade-offs

Understanding when the extra space is worth it:

```python
def compare_approaches(nums, target):
    """Compare space vs time trade-offs."""
    
    # Approach 1: No extra space
    def two_sum_O1_space(nums, target):
        """
        Time: O(n²)
        Space: O(1)
        
        Good when: Memory very limited, small array
        """
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                if nums[i] + nums[j] == target:
                    return [i, j]
        return []
    
    # Approach 2: Hash table
    def two_sum_On_space(nums, target):
        """
        Time: O(n)
        Space: O(n)
        
        Good when: Array large, many queries
        """
        seen = {}
        for i, num in enumerate(nums):
            if target - num in seen:
                return [seen[target - num], i]
            seen[num] = i
        return []
    
    # For 1 million elements:
    # O(n²): ~1 trillion operations (~hours)
    # O(n) with hash: ~1 million operations (< 1 second)
    # Extra memory: ~8MB for hash table
    # 
    # Trade-off is almost always worth it!
```

## Further Learning

The patterns above cover the most important hash table techniques for coding interviews and real-world applications. For additional perspectives:


- **Advanced Hash Table Internals**: Some resources discuss collision resolution strategies (chaining vs open addressing) and hash function design
- **Language-Specific Optimizations**: Different languages have different hash table implementations with varying performance characteristics
- **Theoretical Analysis**: Academic sources cover formal analysis of hash table operations and probabilistic guarantees

The key is recognizing when O(1) lookup can eliminate nested loops and understanding the space trade-off is usually worthwhile.

## Practice on LeetCode

- [1. Two Sum](https://leetcode.com/problems/two-sum/)
- [49. Group Anagrams](https://leetcode.com/problems/group-anagrams/)
- [560. Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/)
