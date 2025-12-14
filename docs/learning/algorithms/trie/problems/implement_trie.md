# Implement Trie (Prefix Tree)

**Difficulty**: Medium  
**LeetCode**: [#208](https://leetcode.com/problems/implement-trie-prefix-tree/)

## Problem Statement

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

## Approach

Create node class with:

- Dictionary of children (char -> node)
- Boolean flag for word end

Operations:

- Insert: Follow/create path, mark end
- Search: Follow path, check end flag
- StartsWith: Follow path only

## Solution

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

## Step-by-Step Walkthrough

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
   +-- a
      +-- p
         +-- p
            +-- l
               +-- e (is_end=True)

search("apple"):
  Follow: root -> a -> p -> p -> l -> e
  Check is_end: True
  Return True

search("app"):
  Follow: root -> a -> p -> p
  Check is_end: False (not marked as word end)
  Return False

startsWith("app"):
  Follow: root -> a -> p -> p
  Path exists, don't check is_end
  Return True

insert("app"):
  Follow: root -> a -> p -> p
  Already exists, mark is_end = True
  
  Trie structure:
  root
   +-- a
      +-- p
         +-- p (is_end=True, now marked!)
            +-- l
               +-- e (is_end=True)

search("app"):
  Follow: root -> a -> p -> p
  Check is_end: True (now marked)
  Return True
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
