---
title: Learning Resources
description: A curated collection of software engineering fundamentals, from algorithms and data structures to system design and cloud AI.
---

# Learning Resources

A structured path through software engineering fundamentals. Each guide is written to help you move from concept to practice efficiently, with visual explanations and hands-on examples.

<div class="grid cards" markdown>

-   :material-graph:{ .lg .middle } **Algorithm Patterns**

    ---

    Master 12+ essential patterns with visual explanations, step-by-step walkthroughs, and LeetCode practice problems.

    [:octicons-arrow-right-24: Open Pattern Library](algorithms/index.md)

-   :material-database:{ .lg .middle } **Data Structures**

    ---

    From arrays to tries, understand when and why to use each structure with complexity analysis.

    [:octicons-arrow-right-24: Browse Structures](data_structures/index.md)

-   :material-account-voice:{ .lg .middle } **Interview Preparation**

    ---

    A 7-step framework for technical interviews plus communication strategies and practice plans.

    [:octicons-arrow-right-24: Start Preparing](interview_preparation/index.md)

-   :material-server-network:{ .lg .middle } **System Design**

    ---

    Scalability, reliability, and maintainability principles for building production systems.

    [:octicons-arrow-right-24: Learn Design](additional_topics/system_design/index.md)

-   :material-cloud-circle:{ .lg .middle } **Cloud AI Platforms**

    ---

    Hands-on guides for Google Vertex AI, from setup to deployment.

    [:octicons-arrow-right-24: Explore Cloud AI](cloud_ai/index.md)

-   :material-library:{ .lg .middle } **Additional Topics**

    ---

    Curated resources on distributed systems, networking, security, and engineering best practices.

    [:octicons-arrow-right-24: Browse Topics](additional_topics/index.md)

</div>

---

## Learning Path

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RECOMMENDED PROGRESSION                            │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
    │   FOUNDATION  │       │   PATTERNS    │       │   ADVANCED    │
    │               │       │               │       │               │
    │ Data          │──────>│ Sliding       │──────>│ System        │
    │ Structures    │       │ Window        │       │ Design        │
    │               │       │               │       │               │
    │ Arrays        │       │ Two Pointers  │       │ Distributed   │
    │ Hash Tables   │       │               │       │ Systems       │
    │ Trees         │       │ Dynamic       │       │               │
    │ Graphs        │       │ Programming   │       │ Cloud AI      │
    │               │       │               │       │               │
    │ Complexity    │       │ Backtracking  │       │ Interview     │
    │ Analysis      │       │               │       │ Prep          │
    └───────────────┘       └───────────────┘       └───────────────┘
          │                       │                       │
          │                       │                       │
          ▼                       ▼                       ▼
    2-3 weeks              4-6 weeks               Ongoing
```

---

## Algorithm Patterns at a Glance

Each pattern includes conceptual overview, step-by-step approach, and worked LeetCode examples.

| Pattern | Use Case | Complexity | Links |
|---------|----------|------------|-------|
| **Sliding Window** | Contiguous subarrays, substring problems | O(n) | [Notes](algorithms/sliding_window/index.md) |
| **Two Pointers** | Sorted arrays, palindromes, partitioning | O(n) | [Notes](algorithms/two_pointers/index.md) |
| **Fast & Slow** | Cycle detection, middle element | O(n) | [Notes](algorithms/fast_slow_pointers/index.md) |
| **Dynamic Programming** | Overlapping subproblems, optimization | O(n) to O(n^2) | [Notes](algorithms/dynamic_programming/index.md) |
| **Backtracking** | Permutations, combinations, constraint satisfaction | O(2^n) | [Notes](algorithms/backtracking/index.md) |
| **Binary Search on Answer** | Optimization with monotonic check | O(n log k) | [Notes](algorithms/binary_search_on_answer/index.md) |
| **Greedy** | Local optima lead to global optima | O(n log n) | [Notes](algorithms/greedy/index.md) |
| **Heap / Priority Queue** | Top-k, scheduling, streaming | O(n log k) | [Notes](algorithms/heap_priority_queue/index.md) |
| **Monotonic Stack** | Next greater/smaller element | O(n) | [Notes](algorithms/monotonic_stack/index.md) |
| **Graph Traversal** | BFS/DFS, connectivity, shortest path | O(V + E) | [Notes](algorithms/graph_traversal/index.md) |
| **Trie** | Prefix matching, autocomplete | O(m) | [Notes](algorithms/trie/index.md) |

---

## How to Use These Notes

<div class="grid" markdown>

!!! tip "Active Learning"

    Don't just read the solutions. Write code from scratch, trace through examples by hand, and explain approaches out loud.

!!! tip "Pattern Recognition"

    When stuck on a new problem, ask: "What pattern does this remind me of?" The pattern library helps build this intuition.

!!! tip "Spaced Repetition"

    Revisit problems after a few days. If you can't solve it again, you haven't truly learned it yet.

!!! tip "Track Progress"

    Keep a log of problems solved and patterns practiced. Celebrate consistency over cramming.

</div>

---

## Quick Reference

| Resource | Best For |
|----------|----------|
| [Algorithm Patterns](algorithms/index.md) | Systematic problem-solving techniques |
| [Data Structures](data_structures/index.md) | Understanding when to use which structure |
| [Interview Prep](interview_preparation/index.md) | Communication and strategy under pressure |
| [System Design](additional_topics/system_design/index.md) | Designing scalable systems |
| [Distributed Systems](additional_topics/distributed_systems/index.md) | Consensus, consistency, and resilience |
| [Cloud AI](cloud_ai/index.md) | Hands-on with Vertex AI and cloud ML |
