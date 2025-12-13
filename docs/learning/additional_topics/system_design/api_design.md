---
title: API Design
description: Patterns and protocols for service communication.
---

# API Design

Designing clean, consistent, and usable interfaces for your services.

---

## Protocols

### REST (Representational State Transfer)

- **Resource-based**: `/users/123`.
- **Verbs**: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove).
- **Stateless**: Server stores no client context.
- **Pros**: Standard, cacheable, decoupled.
- **Cons**: Over-fetching/under-fetching data.

### GraphQL

- **Query language for APIs**.
- **Client-driven**: Client asks for exactly what it needs.
- **Pros**: No over-fetching, strong typing, single endpoint.
- **Cons**: Complex caching, N+1 query problems, complexity on server.

### gRPC

- **RPC (Remote Procedure Call)** framework by Google.
- **Protocol Buffers**: Binary serialization (fast, compact).
- **Pros**: High performance, strict contracts, streaming support.
- **Cons**: Browser support requires proxy (gRPC-Web), harder to debug (binary).

---

## Best Practices

### Idempotency
Crucial for distributed systems. If a client retries a request (due to timeout), the result should be the same.

- **Safe methods**: GET, HEAD, OPTIONS (should not change state).
- **Idempotent methods**: PUT, DELETE.
- **Non-idempotent**: POST (usually). *Fix*: Use an `Idempotency-Key` header.

### Versioning

- **URI Versioning**: `/v1/users` (Clear, but breaks links).
- **Header Versioning**: `Accept: application/vnd.myapi.v1+json` (Cleaner URLs, harder to test in browser).

### Pagination

- **Offset-based**: `LIMIT 10 OFFSET 20`. Simple, but slow on large datasets and unstable if items are added/deleted.
- **Cursor-based**: `LIMIT 10 AFTER cursor_id`. Efficient, stable, but harder to implement "jump to page X".
