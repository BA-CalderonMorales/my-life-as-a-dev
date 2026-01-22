---
title: System Design
description: The art of designing scalable, reliable, and maintainable software systems.
---

# System Design

> "Design is not just what it looks like and feels like. Design is how it works." — Steve Jobs

System design is the process of defining the architecture, components, modules, interfaces, and data for a system to satisfy specified requirements.

<div class="grid cards" markdown>

-   :material-arrow-expand-all:{ .lg .middle } **Scalability**

    ---

    Vertical vs horizontal scaling, load balancing, caching, and sharding strategies.

    [:octicons-arrow-right-24: Scalability Guide](scalability.md)

-   :material-api:{ .lg .middle } **API Design**

    ---

    REST, GraphQL, gRPC patterns and best practices for service interfaces.

    [:octicons-arrow-right-24: API Design Guide](api_design.md)

</div>

---

## The Three Pillars

Every production system must balance these concerns:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM DESIGN PILLARS                             │
└─────────────────────────────────────────────────────────────────────────────┘

         RELIABILITY              SCALABILITY             MAINTAINABILITY
    ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
    │ Works correctly │      │ Handles growth  │      │ Easy to operate │
    │ under adversity │      │ efficiently     │      │ and evolve      │
    ├─────────────────┤      ├─────────────────┤      ├─────────────────┤
    │ - Fault tolerant│      │ - Horizontal    │      │ - Observability │
    │ - Redundancy    │      │ - Vertical      │      │ - Simplicity    │
    │ - Graceful fail │      │ - Auto-scaling  │      │ - Documentation │
    └─────────────────┘      └─────────────────┘      └─────────────────┘
```

| Pillar | Definition | Key Practices |
|--------|------------|---------------|
| **Reliability** | System works correctly despite faults | Redundancy, failover, testing, monitoring |
| **Scalability** | System handles increased load | Load balancing, caching, sharding, CDN |
| **Maintainability** | System is easy to operate and evolve | Clean code, documentation, observability |

---

## Core Concepts

### CAP Theorem

In a distributed data store, you can only guarantee two of the three:

```text
                          Consistency
                              /\
                             /  \
                            /    \
                           / CP   \
                          /________\
                         /          \
                        /     AP     \
               Availability ──────── Partition
                                     Tolerance
```

| Property | Description |
|----------|-------------|
| **Consistency** | Every read receives the most recent write or an error |
| **Availability** | Every request receives a response (not necessarily the latest) |
| **Partition Tolerance** | System works despite network failures between nodes |

!!! warning "Reality Check"

    Partition tolerance is mandatory in distributed systems. You choose between **CP** (Consistency + Partition Tolerance) and **AP** (Availability + Partition Tolerance).

### ACID vs. BASE

| ACID (RDBMS) | BASE (NoSQL) |
|--------------|--------------|
| **A**tomicity | **B**asically **A**vailable |
| **C**onsistency | **S**oft state |
| **I**solation | **E**ventual consistency |
| **D**urability | |
| Strong consistency | High availability |

---

## Back-of-the-Envelope Math

Essential numbers for capacity planning and system design interviews.

### Powers of Two

| Power | Value | Common Name |
|-------|-------|-------------|
| $2^{10}$ | ~1,000 | 1 KB |
| $2^{20}$ | ~1,000,000 | 1 MB |
| $2^{30}$ | ~1,000,000,000 | 1 GB |
| $2^{40}$ | ~1,000,000,000,000 | 1 TB |

### Latency Numbers

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LATENCY COMPARISON                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  L1 Cache Reference           ████                           0.5 ns        │
│  Mutex Lock/Unlock            ████████████████               100 ns        │
│  Main Memory Reference        ████████████████               100 ns        │
│  Send 2KB over 1Gbps          ████████████████████████       20 us         │
│  Read 1MB from Memory         ████████████████████████████   250 us        │
│  Datacenter Round Trip        █████████████████████████████  500 us        │
│  Disk Seek                    ██████████████████████████████ 10 ms         │
│  CA to Netherlands Round Trip ██████████████████████████████ 150 ms        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Operation | Latency |
|-----------|---------|
| L1 Cache Reference | 0.5 ns |
| Mutex Lock/Unlock | 100 ns |
| Main Memory Reference | 100 ns |
| Send 2KB over 1Gbps | 20,000 ns (20 us) |
| Read 1MB from Memory | 250,000 ns (250 us) |
| Datacenter Round Trip | 500,000 ns (500 us) |
| Disk Seek | 10,000,000 ns (10 ms) |
| CA to Netherlands Round Trip | 150,000,000 ns (150 ms) |

---

## System Design Interview Framework

```text
1. CLARIFY REQUIREMENTS (5 min)
   └── Functional requirements
   └── Non-functional requirements (scale, latency, availability)
   └── Constraints and assumptions

2. ESTIMATE SCALE (5 min)
   └── Users: DAU, peak concurrent users
   └── Storage: data size, growth rate
   └── Bandwidth: read/write ratio

3. HIGH-LEVEL DESIGN (10-15 min)
   └── Core components
   └── Data flow
   └── API design

4. DEEP DIVE (15-20 min)
   └── Data model
   └── Scaling strategies
   └── Trade-offs

5. WRAP UP (5 min)
   └── Bottlenecks
   └── Future improvements
   └── Monitoring and alerts
```

---

## Deep Dives

- [Scalability Strategies](scalability.md): Vertical vs Horizontal, Load Balancing, Caching, Sharding
- [API Design](api_design.md): REST, GraphQL, gRPC, and best practices
