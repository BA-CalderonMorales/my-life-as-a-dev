# Number of Islands

**Difficulty**: Medium  
**LeetCode**: [#200](https://leetcode.com/problems/number-of-islands/)

## Problem Statement

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

## Approach

Use DFS or BFS to mark connected components:

1. Iterate through each cell
2. When land ('1') found, increment island count
3. Use DFS/BFS to mark all connected land as visited
4. Continue until all cells processed

Each DFS/BFS call marks one complete island.

## Solution

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

## Step-by-Step Walkthrough

```
grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]

Scan cells:

(0,0) = '1': count = 1, DFS from (0,0)
  DFS marks: (0,0) -> (0,1) -> (1,0) -> (1,1)
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

(3,3) = '1': count = 3, DFS from (3,3)
  DFS marks: (3,3) -> (3,4)

Result: 3 islands
```

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
