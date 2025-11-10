# Backtracking Pattern

Backtracking is a systematic way to explore all possible solutions by building candidates incrementally and abandoning them ("backtracking") as soon as it determines that the candidate cannot lead to a valid solution.

## When to Use Backtracking

Use backtracking when:

- Need to find all possible solutions (permutations, combinations, subsets)
- Constraint satisfaction problems (N-Queens, Sudoku)
- Decision problems with multiple choices at each step
- Exploring paths in a maze or tree
- Problems requiring exhaustive search with pruning

## Core Approach

### The Process

1. **Choose**: Pick a candidate to add to current solution
2. **Explore**: Recursively explore with this choice
3. **Unchoose**: Remove the candidate (backtrack)
4. **Prune**: Skip invalid paths early

### Key Characteristics

- **Recursive**: Naturally expressed as recursion
- **State Management**: Build and tear down state
- **Pruning**: Abandon paths that can't succeed
- **Completeness**: Explores all valid possibilities

## Problem 1: Subsets

**Difficulty**: Medium  
**LeetCode**: #78

### Problem Statement

Given an array of unique integers, return all possible subsets (the power set).

**Example**:
```
Input: nums = [1, 2, 3]
Output: [[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]]
```

### Approach

For each element, we have two choices:
1. Include it in current subset
2. Don't include it

Build subsets by making these choices recursively.

### Solution

```python
def subsets(nums):
    """
    Generate all subsets of nums.
    
    Time Complexity: O(2^n) - 2^n subsets to generate
    Space Complexity: O(n) - recursion depth
    """
    result = []
    
    def backtrack(start, current):
        """
        Build subsets starting from index start.
        
        Args:
            start: Index to start considering elements
            current: Current subset being built
        """
        # Add current subset to result
        result.append(current[:])  # Make a copy
        
        # Try adding each remaining element
        for i in range(start, len(nums)):
            # Choose: add nums[i] to current subset
            current.append(nums[i])
            
            # Explore: recursively build subsets
            backtrack(i + 1, current)
            
            # Unchoose: remove nums[i] (backtrack)
            current.pop()
    
    backtrack(0, [])
    return result

# Alternative: Iterative approach
def subsets_iterative(nums):
    """Generate subsets iteratively."""
    result = [[]]  # Start with empty subset
    
    for num in nums:
        # For each existing subset, create new subset with num added
        result += [curr + [num] for curr in result]
    
    return result

# Test
nums = [1, 2, 3]
print(subsets(nums))
# Output: [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
```

### Step-by-Step Walkthrough

```
nums = [1, 2, 3]

backtrack(0, [])
  Add [] to result
  
  i=0: Choose 1
    backtrack(1, [1])
      Add [1] to result
      
      i=1: Choose 2
        backtrack(2, [1,2])
          Add [1,2] to result
          
          i=2: Choose 3
            backtrack(3, [1,2,3])
              Add [1,2,3] to result
              No more elements
            Unchoose 3: [1,2]
        Unchoose 2: [1]
      
      i=2: Choose 3
        backtrack(3, [1,3])
          Add [1,3] to result
          No more elements
        Unchoose 3: [1]
    Unchoose 1: []
  
  i=1: Choose 2
    backtrack(2, [2])
      Add [2] to result
      
      i=2: Choose 3
        backtrack(3, [2,3])
          Add [2,3] to result
          No more elements
        Unchoose 3: [2]
    Unchoose 2: []
  
  i=2: Choose 3
    backtrack(3, [3])
      Add [3] to result
      No more elements
    Unchoose 3: []

Result: [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
```

## Problem 2: Permutations

**Difficulty**: Medium  
**LeetCode**: #46

### Problem Statement

Given an array of distinct integers, return all possible permutations.

**Example**:
```
Input: nums = [1, 2, 3]
Output: [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
```

### Approach

Build permutations by:
1. For each unused element, add it to current permutation
2. Recursively build rest of permutation
3. Remove element and try next option

Track which elements are used to avoid duplicates.

### Solution

```python
def permute(nums):
    """
    Generate all permutations of nums.
    
    Time Complexity: O(n! * n) - n! permutations, n to copy each
    Space Complexity: O(n) - recursion depth
    """
    result = []
    
    def backtrack(current, remaining):
        """
        Build permutations with current built and remaining elements.
        
        Args:
            current: Current permutation being built
            remaining: Elements not yet used
        """
        # Base case: no remaining elements
        if not remaining:
            result.append(current[:])
            return
        
        # Try each remaining element
        for i in range(len(remaining)):
            # Choose: add remaining[i] to permutation
            element = remaining[i]
            current.append(element)
            
            # Explore: recurse with remaining elements
            new_remaining = remaining[:i] + remaining[i+1:]
            backtrack(current, new_remaining)
            
            # Unchoose: remove element (backtrack)
            current.pop()
    
    backtrack([], nums)
    return result

# Alternative: Using a used set
def permute_with_set(nums):
    """Generate permutations tracking used elements."""
    result = []
    used = set()
    
    def backtrack(current):
        if len(current) == len(nums):
            result.append(current[:])
            return
        
        for num in nums:
            if num not in used:
                # Choose
                used.add(num)
                current.append(num)
                
                # Explore
                backtrack(current)
                
                # Unchoose
                current.pop()
                used.remove(num)
    
    backtrack([])
    return result

# Test
nums = [1, 2, 3]
print(permute(nums))
# Output: [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
```

### Step-by-Step Walkthrough

```
nums = [1, 2, 3]

backtrack([], [1,2,3])
  
  i=0: Choose 1
    backtrack([1], [2,3])
      
      i=0: Choose 2
        backtrack([1,2], [3])
          
          i=0: Choose 3
            backtrack([1,2,3], [])
              Add [1,2,3] to result
          Unchoose 3
      Unchoose 2
      
      i=1: Choose 3
        backtrack([1,3], [2])
          
          i=0: Choose 2
            backtrack([1,3,2], [])
              Add [1,3,2] to result
          Unchoose 2
      Unchoose 3
    Unchoose 1
  
  i=1: Choose 2
    backtrack([2], [1,3])
      ... generates [2,1,3] and [2,3,1]
    Unchoose 2
  
  i=2: Choose 3
    backtrack([3], [1,2])
      ... generates [3,1,2] and [3,2,1]
    Unchoose 3

Result: [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
```

## Problem 3: N-Queens

**Difficulty**: Hard  
**LeetCode**: #51

### Problem Statement

Place n queens on an n×n chessboard so that no two queens attack each other. Return all distinct solutions.

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

### Approach

Place queens row by row:
1. For each row, try placing queen in each column
2. Check if placement is safe (no attacks)
3. Recursively place queens in remaining rows
4. If successful, add solution; otherwise backtrack

Track columns, diagonals, and anti-diagonals under attack.

### Solution

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

### Step-by-Step Walkthrough

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

## Key Takeaways

1. **Choose-Explore-Unchoose**: Core pattern of backtracking
2. **State Management**: Carefully build and tear down state
3. **Pruning**: Eliminate invalid paths early
4. **Completeness**: Explores all valid solutions
5. **Space Efficiency**: Often more space-efficient than iterative approaches

## Common Patterns

### Generation Problems
- Subsets, permutations, combinations
- Generate parentheses
- Letter combinations
- Word break

### Constraint Satisfaction
- N-Queens
- Sudoku solver
- Graph coloring
- Crossword puzzle

### Path Finding
- Maze solving
- Word search in grid
- Rat in a maze
- Knight's tour

## Template Pattern

```python
def backtrack_template(problem_input):
    """General backtracking template."""
    result = []
    
    def backtrack(state, choices):
        """
        Args:
            state: Current solution being built
            choices: Available choices at this step
        """
        # Base case: solution complete
        if is_solution_complete(state):
            result.append(copy_solution(state))
            return
        
        # Try each choice
        for choice in choices:
            # Prune: skip invalid choices
            if not is_valid(choice, state):
                continue
            
            # Choose: add choice to state
            make_choice(state, choice)
            
            # Explore: recurse with updated state
            backtrack(state, get_remaining_choices(choices, choice))
            
            # Unchoose: remove choice (backtrack)
            undo_choice(state, choice)
    
    backtrack(initial_state, all_choices)
    return result
```

## Practice Tips

- Draw the decision tree to visualize recursion
- Identify what constitutes a complete solution
- Think about what choices you have at each step
- Consider what makes a choice invalid (pruning)
- Practice both with and without duplicates
- Understand when to make copies vs modify in-place

## Common Mistakes

- Forgetting to backtrack (not undoing choices)
- Not making copies of results (modifying shared state)
- Missing base case or wrong base case
- Not pruning invalid paths early
- Inefficient state representation
- Off-by-one errors in loop bounds
