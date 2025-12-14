# Graph Traversal Pattern (BFS and DFS)

Graph traversal algorithms systematically visit all vertices and edges in a graph. Breadth-First Search (BFS) and Depth-First Search (DFS) are fundamental patterns that form the basis for many graph algorithms.

## When to Use Graph Traversal

Use this pattern when:


- Exploring all nodes in a graph or tree
- Finding shortest path (unweighted graphs - BFS)
- Detecting cycles in a graph
- Finding connected components
- Level-order traversal or layer-by-layer processing
- Topological sorting (DFS)
- Solving maze or grid problems

## Core Approach

### BFS (Breadth-First Search)

**Pattern**: Explore level by level using a queue
- **Properties**

    - Visits nodes in order of distance from source
    - Finds shortest path in unweighted graphs
    - Uses O(V) space for queue

**Template**:
```python
from collections import deque

def bfs(start):
    queue = deque([start])
    visited = {start}
    
    while queue:
        node = queue.popleft()
        # Process node
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
```

### DFS (Depth-First Search)

**Pattern**: Explore as deep as possible before backtracking
- **Properties**

    - Visits nodes by following paths to their end
    - Can be recursive or iterative (stack)
    - Uses O(V) space for recursion stack
    - Better for cycle detection, topological sort

**Template**:
```python
def dfs(node, visited):
    visited.add(node)
    # Process node
    
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(neighbor, visited)
```

## Problem 1: Number of Islands

**Difficulty**: Medium  
**LeetCode**: #200

### Problem Statement

Given a 2D grid of '1's (land) and '0's (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.

**Example**:
```
Input: grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
Output: 3
```

### Approach

Use DFS or BFS to mark connected components:
1. Iterate through each cell
2. When land ('1') found, increment island count
3. Use DFS/BFS to mark all connected land as visited
4. Continue until all cells processed

Each DFS/BFS call marks one complete island.

### Solution

```python
def num_islands(grid):
    """
    Count islands using DFS.
    
    Time Complexity: O(m * n) - visit each cell once
    Space Complexity: O(m * n) - recursion depth in worst case
    """
    if not grid or not grid[0]:
        return 0
    
    m, n = len(grid), len(grid[0])
    count = 0
    
    def dfs(i, j):
        """Mark all connected land from (i, j)."""
        # Boundary check and water check
        if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] == '0':
            return
        
        # Mark as visited
        grid[i][j] = '0'
        
        # Explore 4 directions
        dfs(i + 1, j)  # down
        dfs(i - 1, j)  # up
        dfs(i, j + 1)  # right
        dfs(i, j - 1)  # left
    
    for i in range(m):
        for j in range(n):
            if grid[i][j] == '1':
                count += 1
                dfs(i, j)  # Mark entire island
    
    return count

# BFS alternative
from collections import deque

def num_islands_bfs(grid):
    """Count islands using BFS."""
    if not grid or not grid[0]:
        return 0
    
    m, n = len(grid), len(grid[0])
    count = 0
    
    def bfs(i, j):
        """Mark all connected land from (i, j) using BFS."""
        queue = deque([(i, j)])
        grid[i][j] = '0'
        
        while queue:
            x, y = queue.popleft()
            
            # Check 4 directions
            for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < m and 0 <= ny < n and grid[nx][ny] == '1':
                    grid[nx][ny] = '0'
                    queue.append((nx, ny))
    
    for i in range(m):
        for j in range(n):
            if grid[i][j] == '1':
                count += 1
                bfs(i, j)
    
    return count

# Test
grid = [
    ["1","1","0","0","0"],
    ["1","1","0","0","0"],
    ["0","0","1","0","0"],
    ["0","0","0","1","1"]
]
print(num_islands(grid))  # Output: 3
```

### Step-by-Step Walkthrough

```
grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]

Scan cells:

(0,0) = '1': count = 1, DFS from (0,0)
  DFS marks: (0,0) → (0,1) → (1,0) → (1,1)
  Grid after:
  ["0","0","0","0","0"],
  ["0","0","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]

(0,1) = '0': skip (already marked)
(0,2) = '0': skip
...continue scanning...

(2,2) = '1': count = 2, DFS from (2,2)
  DFS marks: (2,2)
  Grid after:
  ["0","0","0","0","0"],
  ["0","0","0","0","0"],
  ["0","0","0","0","0"],
  ["0","0","0","1","1"]

...continue scanning...

(3,3) = '1': count = 3, DFS from (3,3)
  DFS marks: (3,3) → (3,4)
  Grid after:
  ["0","0","0","0","0"],
  ["0","0","0","0","0"],
  ["0","0","0","0","0"],
  ["0","0","0","0","0"]

Result: 3 islands
```

## Problem 2: Course Schedule

**Difficulty**: Medium  
**LeetCode**: #207

### Problem Statement

There are numCourses courses labeled 0 to numCourses-1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates you must take course bi before ai. Return true if you can finish all courses.

**Example**:
```
Input: numCourses = 2, prerequisites = [[1,0]]
Output: true
Explanation: Take course 0, then course 1

Input: numCourses = 2, prerequisites = [[1,0],[0,1]]
Output: false
Explanation: Circular dependency
```

### Approach

Detect cycles using DFS:

- Build adjacency list from prerequisites
- Use DFS with three states: unvisited, visiting, visited
- If we revisit a node in "visiting" state, cycle detected
- If all nodes can be visited without cycle, return true

"Visiting" state tracks current DFS path for cycle detection.

### Solution

```python
def can_finish(num_courses, prerequisites):
    """
    Check if courses can be completed (no cycles).
    
    Time Complexity: O(V + E) - visit all nodes and edges
    Space Complexity: O(V + E) - graph and recursion
    """
    # Build adjacency list
    graph = {i: [] for i in range(num_courses)}
    for course, prereq in prerequisites:
        graph[prereq].append(course)
    
    # States: 0 = unvisited, 1 = visiting, 2 = visited
    state = [0] * num_courses
    
    def has_cycle(course):
        """Check if cycle exists starting from course."""
        if state[course] == 1:
            return True  # Cycle detected (revisiting node in current path)
        if state[course] == 2:
            return False  # Already processed
        
        # Mark as visiting
        state[course] = 1
        
        # Check all neighbors
        for neighbor in graph[course]:
            if has_cycle(neighbor):
                return True
        
        # Mark as visited
        state[course] = 2
        return False
    
    # Check each course
    for course in range(num_courses):
        if state[course] == 0:
            if has_cycle(course):
                return False
    
    return True

# Test
print(can_finish(2, [[1,0]]))        # Output: True
print(can_finish(2, [[1,0],[0,1]]))  # Output: False
```

### Step-by-Step Walkthrough

```
Example 1: numCourses = 2, prerequisites = [[1,0]]

Build graph:
  0 → [1]
  1 → []

DFS from course 0:
  state[0] = 1 (visiting)
  Check neighbor 1:
    state[1] = 1 (visiting)
    No neighbors
    state[1] = 2 (visited)
  state[0] = 2 (visited)

DFS from course 1: already visited, skip

No cycles found → return True

Example 2: numCourses = 2, prerequisites = [[1,0],[0,1]]

Build graph:
  0 → [1]
  1 → [0]

DFS from course 0:
  state[0] = 1 (visiting)
  Check neighbor 1:
    state[1] = 1 (visiting)
    Check neighbor 0:
      state[0] = 1 (already visiting!)
      Cycle detected! → return True

Cycle found → return False
```

## Problem 3: Shortest Path in Binary Matrix

**Difficulty**: Medium  
**LeetCode**: #1091

### Problem Statement

Given an n x n binary matrix, find the shortest path from top-left to bottom-right. You can move in 8 directions. Return -1 if no path exists.

**Example**:
```
Input: grid = [
  [0,0,0],
  [1,1,0],
  [1,1,0]
]
Output: 4
Path: (0,0) → (0,1) → (0,2) → (1,2) → (2,2)
```

### Approach

Use BFS for shortest path:

- BFS guarantees shortest path in unweighted graphs
- Start from (0,0), track distance level by level
- Mark cells as visited to avoid reprocessing
- Return distance when reaching destination

BFS finds shortest because it explores by distance layers.

### Solution

```python
from collections import deque

def shortest_path_binary_matrix(grid):
    """
    Find shortest path using BFS.
    
    Time Complexity: O(n²) - visit each cell once
    Space Complexity: O(n²) - queue and visited
    """
    n = len(grid)
    
    # Check if start or end is blocked
    if grid[0][0] == 1 or grid[n-1][n-1] == 1:
        return -1
    
    # BFS with (row, col, distance)
    queue = deque([(0, 0, 1)])
    grid[0][0] = 1  # Mark as visited
    
    # 8 directions
    directions = [
        (-1,-1), (-1,0), (-1,1),
        (0,-1),          (0,1),
        (1,-1),  (1,0),  (1,1)
    ]
    
    while queue:
        row, col, dist = queue.popleft()
        
        # Check if reached destination
        if row == n-1 and col == n-1:
            return dist
        
        # Explore 8 directions
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            
            # Check bounds and if cell is open
            if (0 <= new_row < n and 
                0 <= new_col < n and 
                grid[new_row][new_col] == 0):
                
                grid[new_row][new_col] = 1  # Mark visited
                queue.append((new_row, new_col, dist + 1))
    
    return -1  # No path found

# Test
grid = [
    [0,0,0],
    [1,1,0],
    [1,1,0]
]
print(shortest_path_binary_matrix(grid))  # Output: 4
```

### Step-by-Step Walkthrough

```
grid = [
  [0,0,0],
  [1,1,0],
  [1,1,0]
]

BFS:
Initial: queue = [(0,0,1)]

Level 1 (distance 1):
  Process (0,0,1):
    Not destination
    Add neighbors: (0,1) and (1,0) blocked
    Add (0,1,2): grid[0][1] = 0 → mark and add
    queue = [(0,1,2)]

Level 2 (distance 2):
  Process (0,1,2):
    Not destination
    Check 8 neighbors:
      (0,0): already visited
      (0,2): open → add (0,2,3)
      (1,0): blocked
      (1,1): blocked
      (1,2): open → add (1,2,3)
    queue = [(0,2,3), (1,2,3)]

Level 3 (distance 3):
  Process (0,2,3):
    Not destination
    Neighbors already visited or blocked
  
  Process (1,2,3):
    Not destination
    Add (2,2,4)
    queue = [(2,2,4)]

Level 4 (distance 4):
  Process (2,2,4):
    Destination reached!
    Return 4

Result: 4
```

## Key Takeaways

1. **BFS for Shortest Path**: Always use BFS for unweighted shortest path
2. **DFS for Cycles**: DFS with state tracking detects cycles efficiently
3. **Visited Tracking**: Prevents infinite loops and reprocessing
4. **Grid as Graph**: 2D grids are implicit graphs (cells = nodes)
5. **State Management**: Three states (unvisited/visiting/visited) for cycle detection

## Common Applications

### BFS Applications
- Shortest path in unweighted graphs
- Level-order traversal
- Minimum steps/moves problems
- Connected components (when order matters)

### DFS Applications
- Cycle detection
- Topological sorting
- Path finding (all paths, not shortest)
- Connected components
- Backtracking problems

## Practice Tips

- Choose BFS for shortest path, DFS for exploring all paths
- Always track visited nodes to avoid cycles
- For grids, treat as implicit graphs
- Use deque for BFS queue (efficient popleft)
- Consider iterative DFS with stack if recursion depth is concern
- Draw graph structure for visualization

## Template Pattern

```python
from collections import deque

# BFS Template
def bfs_template(start, graph):
    """BFS traversal template."""
    queue = deque([start])
    visited = {start}
    
    while queue:
        node = queue.popleft()
        # Process node
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

# DFS Template (Recursive)
def dfs_template(node, graph, visited):
    """DFS traversal template."""
    visited.add(node)
    # Process node
    
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs_template(neighbor, graph, visited)

# DFS Template (Iterative)
def dfs_iterative_template(start, graph):
    """Iterative DFS using stack."""
    stack = [start]
    visited = {start}
    
    while stack:
        node = stack.pop()
        # Process node
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                stack.append(neighbor)
```

## Common Mistakes

- Using DFS when BFS is needed for shortest path
- Forgetting to mark nodes as visited
- Not handling disconnected graphs
- Wrong termination condition in BFS
- Modifying graph during traversal incorrectly
- Not considering all possible directions in grid problems
- Stack overflow with deep recursion (use iterative DFS)

## Practice on LeetCode

- [200. Number of Islands](https://leetcode.com/problems/number-of-islands/)
- [133. Clone Graph](https://leetcode.com/problems/clone-graph/)
- [994. Rotting Oranges](https://leetcode.com/problems/rotting-oranges/)
