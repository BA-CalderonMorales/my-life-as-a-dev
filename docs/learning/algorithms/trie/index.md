# Trie (Prefix Tree) Pattern

A Trie is a tree-based data structure for storing strings where each path from root to leaf represents a word. It's particularly efficient for prefix-based operations and is fundamental for dictionary implementations, autocomplete, and spell checking.

## When to Use Trie

Use this pattern when:

- Implementing autocomplete or search suggestions
- Spell checking or word validation
- Prefix matching or searching
- Finding words with common prefixes
- IP routing or longest prefix matching
- Dictionary implementation with prefix queries
- Word games (Boggle, Scrabble validation)

## Core Approach

### Trie Structure

Each node represents a character:
- **Root**: Empty, represents start
- **Children**: Map from character to child node
- **End Flag**: Marks complete words

**Key Properties**:
- Common prefixes share paths
- Space efficient for large word sets with common prefixes
- Fast prefix operations: O(m) where m is word length

### Basic Operations

**Insert**: O(m) - follow/create path for each character
**Search**: O(m) - follow path, check end flag
**StartsWith**: O(m) - follow path, ignore end flag

## Problem 1: Implement Trie (Prefix Tree)

**Difficulty**: Medium  
**LeetCode**: #208

### Problem Statement

Implement a trie with insert, search, and startsWith methods.

**Example**:
```
Trie trie = new Trie()
trie.insert("apple")
trie.search("apple")   -> true
trie.search("app")     -> false
trie.startsWith("app") -> true
trie.insert("app")
trie.search("app")     -> true
```

### Approach

Create node class with:
- Dictionary of children (char -> node)
- Boolean flag for word end

Operations:
- Insert: Follow/create path, mark end
- Search: Follow path, check end flag
- StartsWith: Follow path only

### Solution

```python
class TrieNode:
    """Node in trie structure."""
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    """
    Implement trie (prefix tree).
    
    Time Complexity:
      - insert: O(m) where m is word length
      - search: O(m)
      - startsWith: O(m)
    Space Complexity: O(n * m) where n is number of words
    """
    
    def __init__(self):
        self.root = TrieNode()
    
    def insert(self, word):
        """Insert word into trie."""
        node = self.root
        
        for char in word:
            # Create child if doesn't exist
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        
        # Mark end of word
        node.is_end = True
    
    def search(self, word):
        """Search if word exists in trie."""
        node = self.root
        
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        
        # Must be marked as end of word
        return node.is_end
    
    def startsWith(self, prefix):
        """Check if any word starts with prefix."""
        node = self.root
        
        for char in prefix:
            if char not in node.children:
                return False
            node = node.children[char]
        
        # Don't need to check is_end for prefix
        return True

# Test
trie = Trie()
trie.insert("apple")
print(trie.search("apple"))    # Output: True
print(trie.search("app"))      # Output: False
print(trie.startsWith("app"))  # Output: True
trie.insert("app")
print(trie.search("app"))      # Output: True
```

### Step-by-Step Walkthrough

```
Operations: insert("apple"), search("apple"), search("app"), 
            startsWith("app"), insert("app"), search("app")

insert("apple"):
  Start at root
  'a' not in root.children, create node
  'p' not in node.children, create node
  'p' not in node.children, create node
  'l' not in node.children, create node
  'e' not in node.children, create node
  Mark node.is_end = True
  
  Trie structure:
  root
   └─ a
      └─ p
         └─ p
            └─ l
               └─ e (is_end=True)

search("apple"):
  Follow: root → a → p → p → l → e
  Check is_end: True
  Return True

search("app"):
  Follow: root → a → p → p
  Check is_end: False (not marked as word end)
  Return False

startsWith("app"):
  Follow: root → a → p → p
  Path exists, don't check is_end
  Return True

insert("app"):
  Follow: root → a → p → p
  Already exists, mark is_end = True
  
  Trie structure:
  root
   └─ a
      └─ p
         └─ p (is_end=True, now marked!)
            └─ l
               └─ e (is_end=True)

search("app"):
  Follow: root → a → p → p
  Check is_end: True (now marked)
  Return True
```

## Problem 2: Word Search II

**Difficulty**: Hard  
**LeetCode**: #212

### Problem Statement

Given a 2D board and a list of words, find all words in the board. Words can be formed by sequentially adjacent cells (no cell used more than once per word).

**Example**:
```
Input: board = [
  ["o","a","a","n"],
  ["e","t","a","e"],
  ["i","h","k","r"],
  ["i","f","l","v"]
], words = ["oath","pea","eat","rain"]
Output: ["oath","eat"]
```

### Approach

Combine Trie with DFS:
1. Build trie from word list
2. DFS from each cell
3. Use trie to prune invalid paths early
4. When complete word found, add to results

Trie enables early pruning: stop if prefix not in trie.

### Solution

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.word = None  # Store complete word at end

def find_words(board, words):
    """
    Find all words from list in board using trie + DFS.
    
    Time Complexity: O(m * n * 4^L) where L is max word length
    Space Complexity: O(w * L) for trie, w is number of words
    """
    # Build trie from words
    root = TrieNode()
    for word in words:
        node = root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.word = word  # Store word at leaf
    
    m, n = len(board), len(board[0])
    result = []
    
    def dfs(i, j, node):
        """DFS from (i, j) following trie."""
        char = board[i][j]
        
        # Check if character exists in trie
        if char not in node.children:
            return
        
        next_node = node.children[char]
        
        # Found complete word
        if next_node.word:
            result.append(next_node.word)
            next_node.word = None  # Avoid duplicates
        
        # Mark as visited
        board[i][j] = '#'
        
        # Explore 4 directions
        for di, dj in [(0,1), (0,-1), (1,0), (-1,0)]:
            ni, nj = i + di, j + dj
            if 0 <= ni < m and 0 <= nj < n and board[ni][nj] != '#':
                dfs(ni, nj, next_node)
        
        # Restore cell
        board[i][j] = char
        
        # Optimization: remove leaf nodes
        if not next_node.children:
            del node.children[char]
    
    # Try DFS from each cell
    for i in range(m):
        for j in range(n):
            dfs(i, j, root)
    
    return result

# Test
board = [
    ["o","a","a","n"],
    ["e","t","a","e"],
    ["i","h","k","r"],
    ["i","f","l","v"]
]
words = ["oath","pea","eat","rain"]
print(find_words(board, words))  # Output: ["oath", "eat"]
```

### Step-by-Step Walkthrough

```
board = [
  ["o","a","a","n"],
  ["e","t","a","e"],
  ["i","h","k","r"],
  ["i","f","l","v"]
], words = ["oath","pea","eat","rain"]

Build trie:
  root
   ├─ o → a → t → h (word="oath")
   ├─ p → e → a (word="pea")
   ├─ e → a → t (word="eat")
   └─ r → a → i → n (word="rain")

DFS from (0,0)='o':
  'o' in trie, continue
  Follow children...
  Eventually finds "oath":
    o(0,0) → a(0,1) → t(1,1) → h(2,1)
  Add "oath" to result

DFS from (1,0)='e':
  'e' in trie, continue
  Finds "eat":
    e(1,0) → a(0,1) → t(1,1)
  Add "eat" to result

DFS from other cells:
  No more words found
  "pea" and "rain" not in board

Result: ["oath", "eat"]
```

## Problem 3: Design Add and Search Words Data Structure

**Difficulty**: Medium  
**LeetCode**: #211

### Problem Statement

Design a data structure that supports adding words and searching with '.' wildcard (matches any letter).

**Example**:
```
WordDictionary wd = new WordDictionary()
wd.addWord("bad")
wd.addWord("dad")
wd.addWord("mad")
wd.search("pad")  -> false
wd.search("bad")  -> true
wd.search(".ad")  -> true
wd.search("b..")  -> true
```

### Approach

Extend basic trie with wildcard search:
- Insert same as basic trie
- Search: when '.' encountered, try all children
- Use DFS/recursion to handle wildcards

Wildcard requires exploring all branches at that position.

### Solution

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class WordDictionary:
    """
    Word dictionary with wildcard search.
    
    Time Complexity:
      - addWord: O(m) where m is word length
      - search: O(26^k * m) where k is number of wildcards
    Space Complexity: O(n * m) for n words
    """
    
    def __init__(self):
        self.root = TrieNode()
    
    def addWord(self, word):
        """Add word to dictionary."""
        node = self.root
        
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        
        node.is_end = True
    
    def search(self, word):
        """Search word with '.' wildcard support."""
        return self._search_helper(word, 0, self.root)
    
    def _search_helper(self, word, index, node):
        """
        Recursive helper for wildcard search.
        
        Args:
            word: Search word (may contain '.')
            index: Current position in word
            node: Current trie node
        """
        # Reached end of word
        if index == len(word):
            return node.is_end
        
        char = word[index]
        
        # Wildcard: try all children
        if char == '.':
            for child in node.children.values():
                if self._search_helper(word, index + 1, child):
                    return True
            return False
        
        # Regular character: follow path
        if char not in node.children:
            return False
        
        return self._search_helper(word, index + 1, node.children[char])

# Test
wd = WordDictionary()
wd.addWord("bad")
wd.addWord("dad")
wd.addWord("mad")
print(wd.search("pad"))   # Output: False
print(wd.search("bad"))   # Output: True
print(wd.search(".ad"))   # Output: True
print(wd.search("b.."))   # Output: True
```

### Step-by-Step Walkthrough

```
Operations: addWord("bad"), addWord("dad"), addWord("mad"),
            search("pad"), search("bad"), search(".ad"), search("b..")

Build trie:
  root
   ├─ b → a → d (is_end=True)
   ├─ d → a → d (is_end=True)
   └─ m → a → d (is_end=True)

search("pad"):
  'p' not in root.children
  Return False

search("bad"):
  Follow: root → b → a → d
  Check is_end: True
  Return True

search(".ad"):
  index=0, char='.'
  Try all children of root: b, d, m
  
  Try b:
    _search_helper("ad", 1, node_b)
    Follow: b → a → d
    Check is_end: True
    Return True
  
  Found match, return True

search("b.."):
  index=0, char='b'
  Follow: root → b
  
  index=1, char='.'
  Try all children of b: a
  
  Try a:
    _search_helper(".", 2, node_a)
    index=2, char='.'
    Try all children of a: d
    
    Try d:
      _search_helper("", 3, node_d)
      index=3 == len("b.."), check is_end
      node_d.is_end = True
      Return True
  
  Return True
```

## Key Takeaways

1. **Prefix Efficiency**: Trie excels at prefix operations
2. **Space Trade-off**: Uses more space but faster prefix queries
3. **DFS Integration**: Combines well with backtracking/DFS
4. **Pruning Power**: Enables early termination in searches
5. **Wildcard Support**: Naturally handles pattern matching

## Common Applications

### Dictionary Operations
- Autocomplete/suggestions
- Spell checking
- Word validation
- Prefix counting

### Search Problems
- Word search in grid
- Boggle solver
- Scrabble validation
- IP routing (longest prefix match)

### String Operations
- Finding longest common prefix
- Pattern matching
- T9 predictive text
- URL shortening

## Practice Tips

- Start with basic trie implementation
- Understand node structure (children map + end flag)
- Practice recursive traversal
- Combine with DFS for complex searches
- Consider space optimization (compressed trie)
- Think about whether trie is needed vs simpler approach

## Template Pattern

```python
class TrieNode:
    """Standard trie node."""
    def __init__(self):
        self.children = {}  # char -> TrieNode
        self.is_end = False
        # Optional: word, count, etc.

class Trie:
    """Standard trie template."""
    def __init__(self):
        self.root = TrieNode()
    
    def insert(self, word):
        """Insert word into trie."""
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True
    
    def search(self, word):
        """Search exact word."""
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end
    
    def starts_with(self, prefix):
        """Check if prefix exists."""
        node = self.root
        for char in prefix:
            if char not in node.children:
                return False
            node = node.children[char]
        return True
```

## Common Mistakes

- Forgetting to mark word end with is_end flag
- Confusing search vs startsWith (end flag check)
- Not initializing children dictionary
- Memory leaks by not cleaning up nodes
- Wrong recursion termination in wildcard search
- Not restoring state in backtracking problems
- Using trie when hash set would suffice

## External Resources

For additional learning and deeper insights into trie data structures:

- [How to Efficiently Store and Represent Strings Using a Trie Data Structure](https://lnkd.in/edNtV2yK) - In-depth guide on trie implementation, memory optimization techniques, and advanced string storage strategies. Essential reading for understanding when and how to use tries effectively in production systems.
