# N-Queens

**Difficulty**: Hard  
**LeetCode**: [#51](https://leetcode.com/problems/n-queens/)

## Problem Statement

Place n queens on an n x n chessboard so that no two queens attack each other. Return all distinct solutions.

**Example**:
```
Input: n = 4
Output: [
  [".Q..",
   "...Q",
   "Q...",
   "..Q."],
  ["..Q.",
   "Q...",
   "...Q",
   ".Q.."]
]
```

## Approach

Place queens row by row:

1. For each row, try placing queen in each column
2. Check if placement is safe (no attacks)
3. Recursively place queens in remaining rows
4. If successful, add solution; otherwise backtrack

Track columns, diagonals, and anti-diagonals under attack.

## Solution

```python
def solve_n_queens(n):
    """
    Solve N-Queens problem.
    
    Time Complexity: O(n!) - try n positions in first row, n-1 in second, etc.
    Space Complexity: O(n^2) - board storage
    """
    result = []
    board = [['.'] * n for _ in range(n)]
    
    # Track attacked positions
    cols = set()
    diagonals = set()  # row - col
    anti_diagonals = set()  # row + col
    
    def is_safe(row, col):
        """Check if placing queen at (row, col) is safe."""
        return (col not in cols and
                (row - col) not in diagonals and
                (row + col) not in anti_diagonals)
    
    def backtrack(row):
        """Place queens starting from row."""
        if row == n:
            # All queens placed successfully
            result.append([''.join(row) for row in board])
            return
        
        # Try placing queen in each column
        for col in range(n):
            if is_safe(row, col):
                # Choose: place queen
                board[row][col] = 'Q'
                cols.add(col)
                diagonals.add(row - col)
                anti_diagonals.add(row + col)
                
                # Explore: place queens in next rows
                backtrack(row + 1)
                
                # Unchoose: remove queen (backtrack)
                board[row][col] = '.'
                cols.remove(col)
                diagonals.remove(row - col)
                anti_diagonals.remove(row + col)
    
    backtrack(0)
    return result

# Test
n = 4
solutions = solve_n_queens(n)
for sol in solutions:
    for row in sol:
        print(row)
    print()
# Output: Two valid 4-queens solutions
```

## Step-by-Step Walkthrough

```
n = 4

backtrack(row=0)
  Try col=0: Safe? Yes
    Place Q at (0,0)
    cols={0}, diag={0}, anti={0}
    
    backtrack(row=1)
      Try col=0: Safe? No (col 0 taken)
      Try col=1: Safe? No (diagonal)
      Try col=2: Safe? Yes
        Place Q at (1,2)
        cols={0,2}, diag={0,-1}, anti={0,3}
        
        backtrack(row=2)
          Try col=0: Safe? No (anti-diagonal)
          Try col=1: Safe? No (diagonal)
          Try col=2: Safe? No (col taken)
          Try col=3: Safe? No (anti-diagonal)
          No valid placement, backtrack
        
        Remove Q from (1,2)
      
      Try col=3: Safe? Yes
        Place Q at (1,3)
        ... continue exploring
        Eventually finds solution [.Q.., ...Q, Q..., ..Q.]
      
  Try col=1: Safe? Yes
    Place Q at (0,1)
    ... explore and find solution [..Q., Q..., ...Q, .Q..]

Result: Two valid solutions
```

## Key Insight: Diagonal Tracking

Queens attack along diagonals. How do we efficiently check this?

- **Main diagonal**: All cells on same diagonal have same `row - col` value
- **Anti-diagonal**: All cells on same anti-diagonal have same `row + col` value

This allows O(1) checks using sets instead of scanning the board.

## Personal Notes

*Add your own notes, insights, and variations here as you practice this problem.*
