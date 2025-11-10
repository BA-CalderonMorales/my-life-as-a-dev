# Algorithm Patterns

Mastering algorithmic patterns is essential for solving coding challenges efficiently. This section covers the most common patterns you'll encounter in technical interviews and real-world development.

## What Are Algorithm Patterns?

Algorithm patterns are reusable approaches to solving specific types of problems. Instead of memorizing individual solutions, learning these patterns helps you:

- Recognize problem types quickly
- Apply the right technique systematically
- Adapt solutions to similar problems
- Build problem-solving intuition

## Core Patterns

### Sliding Window
Optimizes problems involving contiguous sequences (subarrays, substrings). Perfect for finding optimal windows or tracking elements within a range.

**Common Use Cases**: Maximum/minimum subarray sum, longest substring problems, fixed-size window aggregations

### Dynamic Programming
Breaks complex problems into overlapping subproblems, storing results to avoid redundant calculations.

**Common Use Cases**: Optimization problems, counting paths, sequence alignment, knapsack variations

### Binary Search on Answer
Uses binary search to efficiently find optimal values by testing candidate solutions.

**Common Use Cases**: Finding minimum/maximum values meeting constraints, capacity problems, resource allocation

### Two Pointers
Uses multiple pointers to traverse data structures, often from different positions or directions.

**Common Use Cases**: Pair finding, array partitioning, merging sorted arrays, palindrome checking

### Fast and Slow Pointers
Uses pointers moving at different speeds to detect cycles or find specific positions.

**Common Use Cases**: Cycle detection, finding middle elements, linked list problems

### Backtracking
Systematically explores all possible solutions by building candidates incrementally and abandoning them when they fail to meet constraints.

**Common Use Cases**: Permutations, combinations, constraint satisfaction, puzzle solving

### Heap and Priority Queue
Maintains elements in sorted order for efficient access to minimum or maximum. Essential for problems requiring frequent extreme value access.

**Common Use Cases**: K-th largest/smallest, merge K lists, task scheduling, running median

### Monotonic Stack
Maintains stack elements in monotonic order to efficiently find next/previous greater or smaller elements.

**Common Use Cases**: Next greater element, histogram problems, temperature problems, range queries

### Graph Traversal (BFS/DFS)
Systematic graph exploration using breadth-first or depth-first search. Foundation for many graph algorithms.

**Common Use Cases**: Shortest path, connected components, cycle detection, level-order traversal

### Greedy Algorithms
Makes locally optimal choices at each step to find global optimum. Fast but requires proof of correctness.

**Common Use Cases**: Activity selection, scheduling, interval problems, optimization with specific properties

### Trie (Prefix Tree)
Tree structure for efficient string prefix operations. Each path represents a word with shared prefixes.

**Common Use Cases**: Autocomplete, spell check, prefix matching, dictionary operations, word games

## How to Use This Guide

Each pattern section includes:

1. **Conceptual Overview** - Understanding when and why to use the pattern
2. **Step-by-Step Approach** - How to apply the pattern systematically
3. **Three LeetCode Examples** - Real problems with complete solutions
4. **Implementation Details** - Code walkthroughs with explanations

Start with a pattern that interests you, work through the examples, and practice applying the approach to similar problems.
