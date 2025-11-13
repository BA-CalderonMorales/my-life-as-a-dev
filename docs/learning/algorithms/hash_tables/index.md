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

## External Resources

For deeper understanding of hash tables and sets:

- [How to Effectively Use Sets and Hash Tables to Solve Coding Interview Problems](https://lnkd.in/e6j4gp2G) - Comprehensive guide on leveraging hash-based data structures to optimize solutions. Learn common patterns, time-space trade-offs, and when to choose hash tables over other data structures.
