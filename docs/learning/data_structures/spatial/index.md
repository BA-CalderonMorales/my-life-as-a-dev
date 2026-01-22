---
title: Spatial Data Structures
description: Organizing data in multi-dimensional space.
tags:
  - Data Structures
  - Algorithms
  - Interview
---

# Spatial Data Structures

Efficiently querying data based on location (e.g., "Find all restaurants within 5km").

---

## Quadtrees
A tree data structure in which each internal node has exactly four children.

- **Concept**: Recursively divide a 2D region into four quadrants.
- **Use Cases**: Image processing, collision detection, view frustum culling.
- **Complexity**: Insert/Search is roughly $O(\log N)$, but depends on distribution.

## K-D Trees (k-dimensional tree)
A binary space partitioning tree.

- **Concept**: Cycle through dimensions (x, y, z...) at each level to split the plane.
    - Level 0: Split by X-coordinate.
    - Level 1: Split by Y-coordinate.
- **Use Cases**: Nearest neighbor search (KNN) in multi-dimensional space.
- **Pros**: Good for static data.
- **Cons**: Rebalancing is expensive (bad for dynamic data).

## R-Trees
Tree data structure used for spatial access methods.

- **Concept**: Groups nearby objects and represents them with their minimum bounding rectangle (MBR).
- **Use Cases**: "Find all items inside this rectangle". Used heavily in databases like PostGIS.
- **Pros**: Balanced, good for disk storage.

## Geohashing
A system for encoding a geographic location into a short string of letters and digits.

- **Concept**: Interleave bits of latitude and longitude.
- **Property**: Shared prefix = proximity.
- **Example**: `u4pruydqqvj`
- **Use Cases**: Simple proximity search in key-value stores (Redis, DynamoDB).
