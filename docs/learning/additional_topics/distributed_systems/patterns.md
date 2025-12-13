---
title: Resiliency Patterns
description: Design patterns for surviving failure.
---

# Resiliency Patterns

"Everything fails, all the time." — Werner Vogels

---

## Circuit Breaker
Prevent cascading failures. If a service fails repeatedly, stop calling it for a while to let it recover.

- **Closed**: Normal operation. Calls go through.
- **Open**: Fails immediately (fast fail). No calls go through.
- **Half-Open**: Test mode. Allow one request. If success -> Closed. If fail -> Open.

## Bulkhead
Isolate resources so a failure in one part doesn't take down the whole ship.

- **Concept**: Ship compartments. If one floods, the ship stays afloat.
- **Implementation**: Separate thread pools or connection pools for different downstream services.

## Retry with Exponential Backoff
If a call fails, retry. But wait longer between each retry to avoid hammering a struggling service.

- **Jitter**: Add random noise to the wait time to prevent "thundering herd" (all clients retrying at the exact same second).

## Saga Pattern
Managing long-running transactions that span multiple services.

- **Choreography**: Events trigger actions in other services. (Service A emits "OrderCreated", Service B listens and does "ReserveStock").
- **Orchestration**: A central coordinator tells services what to do.
- **Compensating Transactions**: If a step fails, run "undo" logic for previous steps (e.g., "RefundPayment" if "ShipItem" fails).

## CQRS (Command Query Responsibility Segregation)
Separate the model for updating information (Command) from the model for reading information (Query).

- **Pros**: Optimize read/write independently.
- **Cons**: Complexity, eventual consistency.
