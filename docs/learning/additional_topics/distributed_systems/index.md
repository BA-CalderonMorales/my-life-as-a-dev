---
title: Distributed Systems
description: Navigating the chaos of networked computers.
---

# Distributed Systems

> "A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable." — Leslie Lamport

Building reliable systems from unreliable components.

---

## The 8 Fallacies
Beliefs that new engineers often hold, which lead to failure:

1.  The network is reliable.
2.  Latency is zero.
3.  Bandwidth is infinite.
4.  The network is secure.
5.  Topology doesn't change.
6.  There is one administrator.
7.  Transport cost is zero.
8.  The network is homogeneous.

---

## Time & Clocks
In a distributed system, "now" is a fuzzy concept.

- **Physical Clocks**: Quartz crystals drift. NTP helps, but can jump backwards or be out of sync by ms/seconds.
- **Logical Clocks**: Capture causal relationships (happened-before), not physical time.
    - **Lamport Clocks**: Simple counter.
    - **Vector Clocks**: Detect concurrent updates (used in Dynamo, Riak).

---

## Consistency Models
From strongest to weakest:

- **Strict Consistency**: Instant global replication. Impossible in practice (speed of light).
- **Linearizability (Strong)**: Operations appear instantaneous. Once a write completes, all future reads see it.
- **Sequential Consistency**: Operations from the same process are in order; global order is consistent across processes.
- **Eventual Consistency**: If no new updates are made, eventually all accesses will return the last updated value. (DNS, Email).

---

## Deep Dives

- [Consensus Algorithms](consensus.md): Paxos, Raft, and how nodes agree.
- [Resiliency Patterns](patterns.md): Circuit Breakers, Bulkheads, and Sagas.
