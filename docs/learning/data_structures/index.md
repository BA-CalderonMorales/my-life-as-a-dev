---
title: Data Structures
description: Quick entry points into core data structures with practice links.
---

# Data Structures

Catalogue of core structures with quick practice links.

---

## Linear Structures

**Arrays**
:   Prefix/suffix math, in-place transforms, iteration patterns.
    [Practice](https://leetcode.com/problems/product-of-array-except-self/) · [Notes](../algorithms/arrays/index.md)

**Linked Lists**
:   Pointer manipulation, cycle detection, reversal.
    [Practice](https://leetcode.com/problems/reverse-linked-list/) · [Notes](../algorithms/fast_slow_pointers/index.md)

**Stacks**
:   LIFO operations, parentheses matching, undo/redo.
    [Practice](https://leetcode.com/problems/valid-parentheses/) · [Notes](../algorithms/monotonic_stack/index.md)

**Queues**
:   FIFO operations, BFS traversal, scheduling.
    [Practice](https://leetcode.com/problems/number-of-recent-calls/) · [Notes](../algorithms/graph_traversal/index.md)

---

## Associative Structures

**Hash Tables**
:   Constant-time lookups for counting/deduping.
    [Practice](https://leetcode.com/problems/two-sum/) · [Notes](../algorithms/hash_tables/index.md)

**Hash Sets**
:   Unique element storage, membership checks.
    [Practice](https://leetcode.com/problems/contains-duplicate/) · [Notes](../algorithms/hash_tables/index.md)

---

## Hierarchical Structures

**Binary Trees**
:   Traversals (pre/in/post/level), depth, balance.
    [Practice](https://leetcode.com/problems/maximum-depth-of-binary-tree/) · [Notes](../algorithms/graph_traversal/index.md)

**Binary Search Trees**
:   Ordered insertion, search, validation.
    [Practice](https://leetcode.com/problems/validate-binary-search-tree/) · [Notes](../algorithms/binary_search_on_answer/index.md)

**Heaps / Priority Queues**
:   Surface extremes fast for scheduling/top-k.
    [Practice](https://leetcode.com/problems/top-k-frequent-elements/) · [Notes](../algorithms/heap_priority_queue/index.md)

**Tries (Prefix Trees)**
:   Prefix lookups for autocomplete/dictionaries.
    [Practice](https://leetcode.com/problems/implement-trie-prefix-tree/) · [Notes](../algorithms/trie/index.md)

---

## Graph Structures

**Adjacency List**
:   Space-efficient sparse graphs, traversal.
    [Practice](https://leetcode.com/problems/number-of-islands/) · [Notes](../algorithms/graph_traversal/index.md)

**Adjacency Matrix**
:   Dense graphs, quick edge lookups.
    [Practice](https://leetcode.com/problems/number-of-provinces/) · [Notes](../algorithms/graph_traversal/index.md)

---

## Specialized Structures

**Probabilistic**
:   Bloom Filters, HyperLogLog, Count-Min Sketch.
    [Notes](probabilistic/index.md)

**Spatial**
:   Quadtrees, K-D Trees, R-Trees, Geohashing.
    [Notes](spatial/index.md)

**Advanced Trees**
:   Segment Trees, Fenwick Trees, B-Trees, Red-Black Trees.
    [Notes](advanced_trees/index.md)

---

## Complexity Reference

| Structure | Access | Search | Insert | Delete | Space |
| --- | --- | --- | --- | --- | --- |
| Array | O(1) | O(n) | O(n) | O(n) | O(n) |
| Linked List | O(n) | O(n) | O(1) | O(1) | O(n) |
| Hash Table | — | O(1) | O(1) | O(1) | O(n) |
| Binary Search Tree | — | O(log n) | O(log n) | O(log n) | O(n) |
| Heap | — | O(n) | O(log n) | O(log n) | O(n) |
| Trie | — | O(m) | O(m) | O(m) | O(n·m) |

*m = key length, n = number of elements*
