---
title: Probabilistic Data Structures
description: Efficient approximations for massive datasets (Bloom Filters, HyperLogLog).
tags:
  - Data Structures
  - System Design
  - Interview
comments: true
---

# Probabilistic Data Structures

When exact answers are too expensive (memory or time), probabilistic structures offer massive efficiency gains in exchange for a small, controlled error rate.

---

## Bloom Filters

A space-efficient probabilistic data structure that is used to test whether an element is a member of a set.

- **False Positives**: Possible (might say "yes" when it's "no").
- **False Negatives**: Impossible (if it says "no", it's definitely "no").
- **Use Cases**:
    - Checking if a username is taken before hitting the DB.
    - Cache filtering (only cache items requested more than once).
    - Weak password detection.

### How it works

1. Start with a bit array of $m$ bits, all set to 0.
2. Use $k$ different hash functions.
3. To **add** an item: Hash it $k$ times, set the bits at those indices to 1.
4. To **check** an item: Hash it $k$ times. If *all* bits at those indices are 1, the item *might* be in the set. If *any* is 0, it is definitely not.

---

## HyperLogLog

An algorithm for the count-distinct problem, approximating the number of distinct elements in a multiset.

- **Memory**: Extremely low (e.g., ~1.5KB for counts up to $10^9$).
- **Error Rate**: Typically < 2%.
- **Use Cases**:
    - Counting unique visitors to a website (DAU/MAU).
    - Analyzing distinct search queries.
    - Network traffic monitoring (unique IP addresses).

### Key Insight
Uses the observation that the cardinality of a stream of uniformly distributed random numbers can be estimated by calculating the maximum number of leading zeros in the binary representation of each number.

---

## Count-Min Sketch

A frequency table for events in a stream. Think of it as a "probabilistic hash map" for counting.

- **Use Cases**:
    - "Heavy hitters" (finding most frequent items).
    - DDoS detection (identifying IPs with high request rates).
- **Trade-off**: Overestimates counts (collisions add to the count), but never underestimates.

---

## Summary Table

| Structure | Answers Question | Error Type | Typical Use |
| :--- | :--- | :--- | :--- |
| **Bloom Filter** | Is $x$ in set $S$? | False Positive | Membership testing |
| **HyperLogLog** | How many unique items? | Approximation | Cardinality estimation |
| **Count-Min Sketch** | How often did $x$ occur? | Overestimation | Frequency / Top-K |
