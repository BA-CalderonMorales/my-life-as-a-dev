---
title: Algorithm Patterns
description: Master algorithmic patterns to recognize problem types, apply systematic techniques, and build problem-solving intuition.
tags:
  - Algorithms
  - Learning
  - Interview
---

# Algorithm Patterns

Instead of memorizing individual solutions, learning these patterns helps you recognize problem types, apply the right technique, and build lasting problem-solving intuition.

<div class="grid cards" markdown>

-   :material-arrow-expand-horizontal:{ .lg .middle } **Sliding Window**

    ---

    Optimize contiguous sequences. Transform O(n^2) to O(n) by maintaining a moving window.

    [:octicons-arrow-right-24: Learn Pattern](sliding_window/index.md)

-   :material-arrow-left-right:{ .lg .middle } **Two Pointers**

    ---

    Traverse from both ends or move pointers together. Essential for sorted arrays and palindromes.

    [:octicons-arrow-right-24: Learn Pattern](two_pointers/index.md)

-   :material-tortoise:{ .lg .middle } **Fast & Slow Pointers**

    ---

    Detect cycles and find middle elements using different pointer speeds.

    [:octicons-arrow-right-24: Learn Pattern](fast_slow_pointers/index.md)

-   :material-table:{ .lg .middle } **Dynamic Programming**

    ---

    Break complex problems into overlapping subproblems. Cache results to avoid redundant work.

    [:octicons-arrow-right-24: Learn Pattern](dynamic_programming/index.md)

-   :material-undo:{ .lg .middle } **Backtracking**

    ---

    Explore all possibilities by building candidates incrementally. Prune invalid paths early.

    [:octicons-arrow-right-24: Learn Pattern](backtracking/index.md)

-   :material-magnify:{ .lg .middle } **Binary Search on Answer**

    ---

    When the answer is monotonic, binary search the solution space instead of enumerating.

    [:octicons-arrow-right-24: Learn Pattern](binary_search_on_answer/index.md)

-   :material-speedometer:{ .lg .middle } **Greedy**

    ---

    Make locally optimal choices that lead to globally optimal solutions.

    [:octicons-arrow-right-24: Learn Pattern](greedy/index.md)

-   :material-sort-variant:{ .lg .middle } **Heap / Priority Queue**

    ---

    Efficiently surface minimum or maximum elements for scheduling and top-k problems.

    [:octicons-arrow-right-24: Learn Pattern](heap_priority_queue/index.md)

-   :material-chart-bar-stacked:{ .lg .middle } **Monotonic Stack**

    ---

    Find next greater/smaller elements in O(n) using stack invariants.

    [:octicons-arrow-right-24: Learn Pattern](monotonic_stack/index.md)

-   :material-graph-outline:{ .lg .middle } **Graph Traversal**

    ---

    BFS for shortest paths, DFS for exhaustive exploration. Master both.

    [:octicons-arrow-right-24: Learn Pattern](graph_traversal/index.md)

-   :material-file-tree:{ .lg .middle } **Trie**

    ---

    Tree structure for efficient prefix operations. Essential for autocomplete and dictionaries.

    [:octicons-arrow-right-24: Learn Pattern](trie/index.md)

-   :material-memory:{ .lg .middle } **Space Complexity**

    ---

    Analyze and optimize memory usage. In-place algorithms and space-time tradeoffs.

    [:octicons-arrow-right-24: Learn Concepts](space_complexity/index.md)

</div>

---

## Pattern Selection Guide

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                         WHICH PATTERN SHOULD I USE?                          │
└──────────────────────────────────────────────────────────────────────────────┘

  "Find contiguous subarray/substring..."
    └──▶ SLIDING WINDOW

  "Find pair/triplet in sorted array..."
    └──▶ TWO POINTERS

  "Detect cycle or find middle..."
    └──▶ FAST & SLOW POINTERS

  "How many ways..." or "Minimum/Maximum..."
    └──▶ DYNAMIC PROGRAMMING

  "Generate all combinations/permutations..."
    └──▶ BACKTRACKING

  "Find minimum/maximum that satisfies..."
    └──▶ BINARY SEARCH ON ANSWER

  "Find k largest/smallest..."
    └──▶ HEAP / PRIORITY QUEUE

  "Next greater/smaller element..."
    └──▶ MONOTONIC STACK

  "Shortest path" or "Connected components..."
    └──▶ GRAPH TRAVERSAL (BFS/DFS)

  "Prefix matching" or "Autocomplete..."
    └──▶ TRIE
```

---

## Pattern Reference Table

| Pattern | Time | Space | Key Indicator | Practice |
|---------|------|-------|---------------|----------|
| **Sliding Window** | O(n) | O(1) | Contiguous sequences | [LC 3](https://leetcode.com/problems/longest-substring-without-repeating-characters/) |
| **Two Pointers** | O(n) | O(1) | Sorted input, pairs | [LC 167](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/) |
| **Fast & Slow** | O(n) | O(1) | Cycles, linked lists | [LC 141](https://leetcode.com/problems/linked-list-cycle/) |
| **Dynamic Programming** | Varies | O(n) | Overlapping subproblems | [LC 322](https://leetcode.com/problems/coin-change/) |
| **Backtracking** | O(2^n) | O(n) | All combinations | [LC 78](https://leetcode.com/problems/subsets/) |
| **Binary Search on Answer** | O(n log k) | O(1) | Monotonic feasibility | [LC 875](https://leetcode.com/problems/koko-eating-bananas/) |
| **Greedy** | O(n log n) | O(1) | Local = global optimal | [LC 45](https://leetcode.com/problems/jump-game-ii/) |
| **Heap** | O(n log k) | O(k) | Top-k, scheduling | [LC 347](https://leetcode.com/problems/top-k-frequent-elements/) |
| **Monotonic Stack** | O(n) | O(n) | Next greater/smaller | [LC 739](https://leetcode.com/problems/daily-temperatures/) |
| **Graph Traversal** | O(V+E) | O(V) | Connectivity, paths | [LC 200](https://leetcode.com/problems/number-of-islands/) |
| **Trie** | O(m) | O(n*m) | Prefix operations | [LC 208](https://leetcode.com/problems/implement-trie-prefix-tree/) |

---

## Each Pattern Section Includes

<div class="grid" markdown>

!!! abstract "Conceptual Overview"

    When and why to use the pattern, with visual diagrams showing the core mechanism.

!!! example "Step-by-Step Approach"

    Systematic methodology you can apply to any problem that fits the pattern.

!!! success "LeetCode Examples"

    Real problems with complete solutions, complexity analysis, and detailed walkthroughs.

!!! tip "Common Pitfalls"

    Mistakes to avoid and edge cases to consider.

</div>

---

## Suggested Learning Order

1. **Week 1-2**: Sliding Window, Two Pointers, Hash Tables
2. **Week 3-4**: Dynamic Programming (start with 1D problems)
3. **Week 5-6**: Backtracking, BFS/DFS
4. **Week 7-8**: Binary Search variants, Heaps
5. **Week 9+**: Monotonic Stack, Tries, Advanced DP
