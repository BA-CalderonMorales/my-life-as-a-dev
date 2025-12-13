---
title: Scalability Strategies
description: Techniques for scaling systems to handle massive load.
---

# Scalability Strategies

Scaling is not just about adding more servers; it's about designing systems that can grow gracefully.

---

## Vertical vs. Horizontal Scaling

### Vertical Scaling (Scale Up)
Adding more power (CPU, RAM, Disk) to an existing machine.

- **Pros**: Simple implementation, no code changes usually required.
- **Cons**: Hard hardware limits, single point of failure, exponential cost.
- **Use Case**: Early stage startups, database masters (initially).

### Horizontal Scaling (Scale Out)
Adding more machines to the pool of resources.

- **Pros**: Theoretically infinite scale, redundancy/fault tolerance, linear cost.
- **Cons**: Increased complexity (data consistency, load balancing, distributed transactions).
- **Use Case**: Web servers, distributed databases (Cassandra, MongoDB).

---

## Load Balancing
Distributes incoming network traffic across a group of backend servers.

### Types

- **L4 (Transport Layer)**: Routes based on IP and Port. Fast, simple, unaware of content.
- **L7 (Application Layer)**: Routes based on URL, Cookies, Headers. Smarter, can do SSL termination, but more CPU intensive.

### Algorithms

- **Round Robin**: Sequential distribution.
- **Least Connections**: Sends to server with fewest active connections.
- **IP Hash**: Maps client IP to a specific server (sticky sessions).

---

## Caching
Storing copies of data in a temporary storage location for faster access.

### Strategies

- **Cache-Aside (Lazy Loading)**: App checks cache. If miss, reads DB, writes to cache.
- **Write-Through**: App writes to cache and DB synchronously. High consistency, higher write latency.
- **Write-Back (Write-Behind)**: App writes to cache only. Cache syncs to DB asynchronously. High write throughput, risk of data loss.

### Eviction Policies

- **LRU (Least Recently Used)**: Discards the least recently used items first.
- **LFU (Least Frequently Used)**: Counts how often an item is needed.
- **FIFO (First In First Out)**: Simple queue.

---

## Database Sharding
Partitioning data across multiple machines.

### Horizontal Sharding
Splitting rows. E.g., Users 1-1M on DB1, 1M-2M on DB2.

- **Pros**: Infinite data growth.
- **Cons**: Complex queries (joins across shards), rebalancing data is painful (Consistent Hashing helps).

### Vertical Sharding
Splitting columns/tables. E.g., User Profile table on DB1, User Photos table on DB2.

- **Pros**: Simple to implement initially.
- **Cons**: Limited by the growth of a single feature.
