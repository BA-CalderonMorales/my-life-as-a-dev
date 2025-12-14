---
title: System Design
description: The art of designing scalable, reliable, and maintainable software systems.
---

# System Design

> "Design is not just what it looks like and feels like. Design is how it works." — Steve Jobs

System design is the process of defining the architecture, components, modules, interfaces, and data for a system to satisfy specified requirements.

---

## The Three Pillars

1.  **Reliability**: The system continues to work correctly (performing the correct function at the desired level of performance) even in the face of adversity (hardware/software faults, human error).
2.  **Scalability**: The system's ability to cope with increased load (traffic volume, data volume, complexity) by adding resources.
3.  **Maintainability**: The system should be productive for engineers and operations to work on over time (fixing bugs, keeping it operational, investigating failures, adapting to new use cases).

---

## Core Concepts

### CAP Theorem
In a distributed data store, you can only guarantee two of the three:


- **Consistency**: Every read receives the most recent write or an error.
- **Availability**: Every request receives a (non-error) response, without the guarantee that it contains the most recent write.
- **Partition Tolerance**: The system continues to operate despite an arbitrary number of messages being dropped (or delayed) by the network between nodes.

*Reality*: Partition tolerance is mandatory in distributed systems. You choose between CP (Consistency/Partition Tolerance) and AP (Availability/Partition Tolerance).

### ACID vs. BASE

- **ACID** (RDBMS): Atomicity, Consistency, Isolation, Durability. Strong consistency.
- **BASE** (NoSQL): Basically Available, Soft state, Eventual consistency. High availability.

---

## Back-of-the-Envelope Math
Powers of two for quick estimation:


- $2^{10} \approx 10^3$ (1 KB)
- $2^{20} \approx 10^6$ (1 MB)
- $2^{30} \approx 10^9$ (1 GB)

Latencies (approximate):


- L1 Cache: 0.5 ns
- Mutex lock/unlock: 100 ns
- Main Memory Ref: 100 ns
- Send 2KB over 1Gbps network: 20,000 ns
- Read 1MB sequentially from memory: 250,000 ns
- Round trip within same datacenter: 500,000 ns
- Disk seek: 10,000,000 ns (10 ms)
- Send packet CA->Netherlands->CA: 150,000,000 ns (150 ms)

---

## Deep Dives

- [Scalability Strategies](scalability.md): Vertical vs Horizontal, Load Balancing, Caching, Sharding.
- [API Design](api_design.md): REST, GraphQL, gRPC, and best practices.
