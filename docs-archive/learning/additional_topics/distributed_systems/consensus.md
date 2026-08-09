---
title: Consensus Algorithms
description: How distributed nodes agree on the truth.
comments: true
---

# Consensus Algorithms

The problem: How do a group of unreliable nodes agree on a single value (e.g., "who is the leader", "what is the next log entry")?

---

## The FLP Impossibility
In an asynchronous system (where messages can be delayed indefinitely) with even *one* faulty process, it is impossible to guarantee consensus in bounded time.
*Practical implication*: We must choose between safety (never agree on wrong value) and liveness (eventually agree). Most algorithms prioritize safety.

---

## Paxos
The "granddaddy" of consensus.

- **Pro**: Mathematically proven correct.
- **Con**: Notoriously difficult to understand and implement.
- **Roles**: Proposers, Acceptors, Learners.

---

## Raft
Designed specifically for understandability. Equivalent to Paxos in fault tolerance.

- **Leader Election**: Nodes elect a leader. All writes go to the leader.
- **Log Replication**: Leader replicates entries to followers.
- **Safety**: A committed entry is never lost.
- **Used in**: Kubernetes (etcd), Consul, CockroachDB.

---

## Two-Phase Commit (2PC)
Used for distributed transactions (e.g., across multiple databases).

1.  **Prepare Phase**: Coordinator asks all participants "Can you commit?". Participants lock resources.
2.  **Commit Phase**: If all say "Yes", Coordinator says "Commit". If any say "No", Coordinator says "Abort".

- **Problem**: Blocking. If Coordinator dies, participants are stuck holding locks.

---

## Three-Phase Commit (3PC)
Adds a "Pre-Commit" phase to 2PC to avoid blocking, but is susceptible to network partitions. Rarely used.
