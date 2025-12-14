---
title: Advanced Trees
description: Specialized trees for specialized problems.
---

# Advanced Trees

Beyond the standard Binary Search Tree.

---

## Segment Trees
Used for storing information about intervals or segments.

- **Problem**: "Given an array, find the sum of elements from index $L$ to $R$, and update values efficiently."
- **Operations**:
    - Range Query: $O(\log N)$
    - Point Update: $O(\log N)$
- **Space**: $O(N)$

## Fenwick Trees (Binary Indexed Trees)
Similar to Segment Trees but uses less space and is easier to implement (bit manipulation magic).

- **Problem**: Prefix sums and updates.
- **Operations**:
    - Prefix Sum: $O(\log N)$
    - Point Update: $O(\log N)$
- **Space**: $O(N)$ (exactly same size as array).

## B-Trees
A self-balancing tree data structure that maintains sorted data and allows searches, sequential access, insertions, and deletions in logarithmic time.

- **Key Feature**: Nodes have many children (high branching factor).
- **Use Case**: Databases and File Systems. Optimized for systems that read and write large blocks of data (disk).

## Red-Black Trees
A kind of self-balancing binary search tree.

- **Properties**:
    1. Every node is either red or black.
    2. Root is black.
    3. No two red nodes are adjacent.
    4. Every path from a node to its descendant NULL nodes has the same number of black nodes.

- **Use Case**: `std::map` in C++, `TreeMap` in Java. General purpose in-memory ordered map.
