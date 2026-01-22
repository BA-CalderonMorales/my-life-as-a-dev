---
title: Distributed Systems
description: Building reliable systems from unreliable components.
tags:
  - Distributed Systems
  - System Design
  - Interview
---

# Distributed Systems

> "A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable." — Leslie Lamport

Building reliable systems from unreliable components.

<div class="grid cards" markdown>

-   :material-handshake:{ .lg .middle } **Consensus**

    ---

    How distributed nodes agree on a single value. Paxos, Raft, and practical implementations.

    [:octicons-arrow-right-24: Consensus Algorithms](consensus.md)

-   :material-shield-half-full:{ .lg .middle } **Resiliency Patterns**

    ---

    Circuit breakers, bulkheads, sagas, and patterns for fault tolerance.

    [:octicons-arrow-right-24: Patterns Guide](patterns.md)

</div>

---

## The 8 Fallacies

Beliefs that new engineers often hold, which lead to failure in distributed systems:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE 8 FALLACIES OF DISTRIBUTED COMPUTING                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. The network is reliable.            5. Topology doesn't change.         │
│  2. Latency is zero.                    6. There is one administrator.      │
│  3. Bandwidth is infinite.              7. Transport cost is zero.          │
│  4. The network is secure.              8. The network is homogeneous.      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Fallacy | Reality |
|---------|---------|
| Network is reliable | Packets drop, connections reset, hardware fails |
| Latency is zero | Network calls are 10,000x slower than local calls |
| Bandwidth is infinite | Serialization overhead, network saturation |
| Network is secure | Defense in depth, encrypt everything |
| Topology doesn't change | Servers added/removed, IPs change |
| One administrator | Multiple teams, permissions, coordination |
| Transport cost is zero | Serialization, protocol overhead, cloud egress |
| Network is homogeneous | Different OSes, protocols, versions |

---

## Time and Clocks

In a distributed system, "now" is a fuzzy concept.

### Physical Clocks

!!! warning "Clock Problems"

    - Quartz crystals drift (~50ppm = 4.3 seconds/day)
    - NTP helps but can jump backwards
    - Clocks across nodes can differ by milliseconds to seconds

### Logical Clocks

Capture causal relationships (happened-before), not physical time.

```text
                    Process A          Process B          Process C
                        │                  │                  │
                        │    Event A1      │                  │
                        ●─────────────────>●  Event B1        │
                        │                  │                  │
                        │                  ●─────────────────>●  Event C1
                        │                  │                  │
                        │  Event A2        ●                  │
                        ●<─────────────────│  Event B2        │
                        │                  │                  │

Lamport Timestamps: A1=1, B1=2, C1=3, B2=4, A2=5
```

| Clock Type | Description | Use Case |
|------------|-------------|----------|
| **Lamport Clocks** | Simple counter, incremented on events | Ordering events |
| **Vector Clocks** | Array of counters per node | Detecting concurrent updates |
| **Hybrid Logical Clocks** | Combines physical + logical | Modern databases (CockroachDB) |

---

## Consistency Models

From strongest to weakest guarantees:

```text
STRONGEST
    │
    ▼
┌───────────────────────────────────────┐
│        STRICT CONSISTENCY              │  Impossible in practice
│  Instant global replication            │  (speed of light)
└───────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────┐
│        LINEARIZABILITY                 │  Operations appear instantaneous
│  "Strong consistency"                  │  Once written, all reads see it
└───────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────┐
│        SEQUENTIAL CONSISTENCY          │  Same-process ops in order
│                                        │  Global order consistent
└───────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────┐
│        CAUSAL CONSISTENCY              │  Causally related ops in order
│                                        │  Concurrent ops may differ
└───────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────┐
│        EVENTUAL CONSISTENCY            │  Eventually all reads return
│  "BASE model"                          │  latest value (DNS, email)
└───────────────────────────────────────┘
    │
    ▼
WEAKEST
```

| Model | Guarantee | Example Systems |
|-------|-----------|-----------------|
| **Linearizability** | Real-time ordering | Spanner, etcd |
| **Sequential** | Global total order | Single-leader DBs |
| **Causal** | Respects causality | CRDT-based systems |
| **Eventual** | Convergence over time | DynamoDB, Cassandra |

---

## Key Patterns Summary

| Pattern | Purpose | Example |
|---------|---------|---------|
| **Leader Election** | Single coordinator | Zookeeper, etcd |
| **Replication** | Durability, read scaling | MySQL replicas |
| **Partitioning** | Write scaling | Sharded databases |
| **Two-Phase Commit** | Distributed transactions | XA transactions |
| **Saga** | Long-running transactions | Microservices workflows |
| **Circuit Breaker** | Fail fast, prevent cascade | Netflix Hystrix |

---

## Deep Dives

- [Consensus Algorithms](consensus.md): Paxos, Raft, and how nodes agree
- [Resiliency Patterns](patterns.md): Circuit Breakers, Bulkheads, and Sagas
