---
title: Backtracking Pattern
description: Systematically explore all possible solutions by building candidates incrementally and pruning invalid paths.
tags:
  - Algorithms
  - Interview
  - Python
---

# Backtracking Pattern

Backtracking systematically explores all possible solutions by building candidates incrementally and abandoning them ("backtracking") as soon as they cannot lead to a valid solution. It's the foundation for solving permutations, combinations, and constraint satisfaction problems.

<div class="grid cards" markdown>

-   :material-speedometer:{ .lg .middle } **Time Complexity**

    ---

    O(k^n) or O(n!) depending on problem (exponential)

-   :material-memory:{ .lg .middle } **Space Complexity**

    ---

    O(n) - recursion depth

</div>

---

## When to Use

!!! tip "Pattern Recognition"

    Look for these keywords in problem statements:

    - "All possible combinations/permutations"
    - "Generate all valid..."
    - "Find all paths"
    - "N-Queens / Sudoku" (constraint satisfaction)
    - "Subsets / Power set"

---

## Visual Explanation

```text
BACKTRACKING DECISION TREE
─────────────────────────────────────────────────────────────────────

Subsets of [1, 2, 3]:

                            []
                    ┌───────┴───────┐
                 include 1?       exclude 1
                    │                 │
                   [1]               []
              ┌────┴────┐       ┌────┴────┐
           incl 2   excl 2   incl 2   excl 2
              │        │        │        │
            [1,2]    [1]      [2]       []
           ┌──┴──┐  ┌─┴─┐   ┌─┴─┐    ┌─┴─┐
          +3  no +3 no +3  +3 no  +3 no
           │    │    │    │    │    │    │
        [1,2,3][1,2][1,3][1][2,3][2][3] []


CHOOSE → EXPLORE → UNCHOOSE
─────────────────────────────────────────────────────────────────────

def backtrack(current, choices):
    if is_solution(current):
        save(current)
        return
    
    for choice in choices:
        if is_valid(choice):
            current.add(choice)      # CHOOSE
            backtrack(current)       # EXPLORE
            current.remove(choice)   # UNCHOOSE (backtrack!)
```

---

## Core Approach

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKTRACKING TEMPLATE                               │
└─────────────────────────────────────────────────────────────────────────────┘

    1. BASE CASE
       └── If solution is complete, save it and return

    2. ITERATE CHOICES
       └── For each valid choice at current position:

    3. CHOOSE
       └── Add choice to current solution

    4. EXPLORE
       └── Recursively call with updated state

    5. UNCHOOSE
       └── Remove choice (restore state for next iteration)

    6. PRUNE (optional)
       └── Skip invalid paths early to improve performance
```

| Step | Purpose |
|------|---------|
| **Choose** | Make a decision, modify state |
| **Explore** | Recursively solve smaller subproblem |
| **Unchoose** | Restore state for trying next option |
| **Prune** | Skip branches that can't lead to valid solutions |

---

## Problem 1: Subsets

**Difficulty**: Medium | **LeetCode**: #78

### Problem Statement

Given an array of unique integers, return all possible subsets (the power set).

```
Input: nums = [1, 2, 3]
Output: [[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]]
```

### Solution

```python
def subsets(nums):
    """
    Time: O(2^n) - 2^n subsets to generate
    Space: O(n) - recursion depth
    """
    result = []
    
    def backtrack(start, current):
        result.append(current[:])  # Add copy of current subset
        
        for i in range(start, len(nums)):
            current.append(nums[i])    # CHOOSE
            backtrack(i + 1, current)   # EXPLORE
            current.pop()               # UNCHOOSE
    
    backtrack(0, [])
    return result
```

### Walkthrough

```text
nums = [1, 2, 3]

backtrack(0, [])
├── Add [] to result
├── Choose 1 → backtrack(1, [1])
│   ├── Add [1]
│   ├── Choose 2 → backtrack(2, [1,2])
│   │   ├── Add [1,2]
│   │   └── Choose 3 → backtrack(3, [1,2,3])
│   │       └── Add [1,2,3]
│   └── Choose 3 → backtrack(3, [1,3])
│       └── Add [1,3]
├── Choose 2 → backtrack(2, [2])
│   ├── Add [2]
│   └── Choose 3 → backtrack(3, [2,3])
│       └── Add [2,3]
└── Choose 3 → backtrack(3, [3])
    └── Add [3]

Result: [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
```

---

## Problem 2: Permutations

**Difficulty**: Medium | **LeetCode**: #46

### Problem Statement

Given an array of distinct integers, return all possible permutations.

```
Input: nums = [1, 2, 3]
Output: [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
```

### Solution

```python
def permute(nums):
    """
    Time: O(n! * n) - n! permutations, n to copy each
    Space: O(n) - recursion depth
    """
    result = []
    
    def backtrack(current, remaining):
        if not remaining:
            result.append(current[:])
            return
        
        for i in range(len(remaining)):
            current.append(remaining[i])
            backtrack(current, remaining[:i] + remaining[i+1:])
            current.pop()
    
    backtrack([], nums)
    return result
```

---

## Practice Problems

| Problem | Difficulty | Key Concept | Link |
|---------|------------|-------------|------|
| Subsets | Medium | Include/exclude choice | [Solution](problems/subsets.md) |
| Permutations | Medium | Track remaining elements | [Solution](problems/permutations.md) |
| N-Queens | Hard | Constraint validation | [Solution](problems/n_queens.md) |
| Combination Sum | Medium | Allow repeated elements | [LC 39](https://leetcode.com/problems/combination-sum/) |

---

## Key Takeaways

<div class="grid" markdown>

!!! success "Do This"

    - Always restore state after exploring (unchoose)
    - Prune invalid branches early
    - Use a `start` index to avoid duplicates in subsets

!!! danger "Avoid This"

    - Forgetting to make copies when saving solutions
    - Not restoring state (leads to incorrect results)
    - Missing base case (infinite recursion)

</div>

---

## LeetCode Practice

- [78. Subsets](https://leetcode.com/problems/subsets/)
- [46. Permutations](https://leetcode.com/problems/permutations/)
- [51. N-Queens](https://leetcode.com/problems/n-queens/)
- [39. Combination Sum](https://leetcode.com/problems/combination-sum/)
- [79. Word Search](https://leetcode.com/problems/word-search/)
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

## Systematic Framework for Mastering Backtracking

Backtracking can seem daunting, but following a systematic approach makes any problem solvable. Here's a bulletproof framework.

### The 7-Step Backtracking Framework

#### Step 1: Identify the Problem Type

- **Ask yourself**

    - Do I need all possible solutions? (Yes → Backtracking likely needed)
    - Are there constraints that eliminate many possibilities? (Yes → Pruning opportunity)
    - Can I build solutions incrementally? (Yes → Good fit)

- **Common indicators**

    - "Find all..."
    - "Generate all..."
    - "Count number of ways..."
    - Constraint satisfaction (Sudoku, scheduling)

#### Step 2: Define Your State

What information do you need to track?

```python
# Example: N-Queens
state = {
    'board': [['.'] * n for _ in range(n)],
    'cols': set(),        # Columns under attack
    'diagonals': set(),   # Diagonals under attack
    'anti_diagonals': set()
}

# Example: Permutations
state = {
    'current': [],  # Current permutation being built
    'used': set()   # Elements already used
}

# Keep state minimal - only what's needed for decision making
```

#### Step 3: Identify Choice Points

At each step, what decisions can you make?

```python
def get_choices(state):
    """
    Return valid choices at current state.
    
    For N-Queens: which columns in current row
    For Permutations: which unused elements
    For Sudoku: which numbers (1-9) in current cell
    """
    # This varies by problem
    pass

# Key: Choices should be mutually exclusive
# Each choice leads to different branch of solution tree
```

#### Step 4: Define Valid Choice Function

When is a choice valid?

```python
def is_valid(choice, state):
    """
    Check if choice satisfies all constraints.
    
    This is your pruning function - crucial for performance.
    """
    # Example: N-Queens
    # Invalid if: column, diagonal, or anti-diagonal under attack
    
    # Example: Sudoku
    # Invalid if: number already in row, column, or 3x3 box
    
    # Return False as early as possible to prune tree
    pass
```

#### Step 5: Implement Backtracking Template

```python
def backtrack(state, result):
    """
    Universal backtracking template.
    
    Adapt by:
    1. Changing base case check
    2. Customizing choice generation
    3. Defining what makes choice valid
    4. Specifying how to make/unmake choice
    """
    # BASE CASE: Solution complete
    if is_solution_complete(state):
        result.append(copy_solution(state))
        return
    
    # RECURSIVE CASE: Try each choice
    for choice in get_choices(state):
        # PRUNE: Skip invalid choices
        if not is_valid(choice, state):
            continue
        
        # CHOOSE: Make the choice
        make_choice(state, choice)
        
        # EXPLORE: Recursively solve subproblem
        backtrack(state, result)
        
        # UNCHOOSE: Undo the choice (backtrack)
        unmake_choice(state, choice)
```

#### Step 6: Optimize with Pruning

Good pruning can reduce time from hours to milliseconds.

```python
# Example: Combination Sum
def combination_sum(candidates, target):
    """
    Find combinations that sum to target.
    
    Without pruning: Try all combinations (exponential)
    With pruning: Skip branches that exceed target early
    """
    result = []
    candidates.sort()  # Sort for pruning
    
    def backtrack(start, current, current_sum):
        if current_sum == target:
            result.append(current[:])
            return
        
        for i in range(start, len(candidates)):
            num = candidates[i]
            
            # PRUNE: If current sum + num exceeds target,
            # all future numbers will too (since sorted)
            if current_sum + num > target:
                break  # Skip entire remaining branch
            
            current.append(num)
            backtrack(i, current, current_sum + num)
            current.pop()
    
    backtrack(0, [], 0)
    return result

# Pruning impact:
# candidates = [2,3,5], target = 8
# Without pruning: Explores ~100 states
# With pruning: Explores ~20 states (5x speedup)
```

#### Step 7: Analyze and Improve

After initial implementation:


- **Time Complexity**

    - Worst case: O(b^d) where b = branching factor, d = depth
    - With pruning: Often much better in practice
    - Example: N-Queens is O(n!) worst case, but pruning makes it tractable

- **Space Complexity**

    - Call stack: O(d) for recursion depth
    - State storage: Depends on problem
    - Result storage: O(number of solutions)

- **Optimization checklist**

    - [ ] Sorted input for better pruning?
    - [ ] Can skip duplicate choices?
    - [ ] State representation minimal?
    - [ ] Early termination possible?

### Advanced Patterns

#### Pattern 1: Avoiding Duplicates

```python
def subsets_with_duplicates(nums):
    """
    Generate unique subsets when input has duplicates.
    
    Key: Sort and skip consecutive duplicates at same level.
    """
    nums.sort()
    result = []
    
    def backtrack(start, current):
        result.append(current[:])
        
        for i in range(start, len(nums)):
            # Skip duplicate elements at same recursion level
            if i > start and nums[i] == nums[i-1]:
                continue
            
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()
    
    backtrack(0, [])
    return result

# Input: [1, 2, 2]
# Without dedup: [[],[1],[1,2],[1,2,2],[1,2],[2],[2,2],[2]]
# With dedup:    [[],[1],[1,2],[1,2,2],[2],[2,2]]
```

#### Pattern 2: Memoization for Overlapping Subproblems

```python
def word_break_all(s, word_dict):
    """
    Find all ways to break string using dictionary words.
    
    Problem: Same substring processed multiple times
    Solution: Memoize results by substring
    """
    memo = {}
    
    def backtrack(start):
        if start in memo:
            return memo[start]
        
        if start == len(s):
            return [[]]
        
        result = []
        for end in range(start + 1, len(s) + 1):
            word = s[start:end]
            if word in word_dict:
                # Found valid word - recurse on rest
                for rest in backtrack(end):
                    result.append([word] + rest)
        
        memo[start] = result
        return result
    
    return [' '.join(words) for words in backtrack(0)]

# s = "catsanddog", dict = ["cat","cats","and","sand","dog"]
# Without memo: O(2^n) - exponential
# With memo: O(n^3) - polynomial
```

#### Pattern 3: Constraint Propagation

```python
def sudoku_solver(board):
    """
    Solve Sudoku with constraint propagation.
    
    Instead of trying all numbers 1-9,
    maintain set of possible values for each cell.
    """
    # Possible values for each cell
    possible = [[set(range(1, 10)) if board[i][j] == 0 else set()
                 for j in range(9)] for i in range(9)]
    
    # Remove impossibilities based on initial state
    for i in range(9):
        for j in range(9):
            if board[i][j] != 0:
                propagate_constraints(board, possible, i, j, board[i][j])
    
    def backtrack():
        # Find cell with fewest possibilities (most constrained)
        min_choices = 10
        best_cell = None
        
        for i in range(9):
            for j in range(9):
                if board[i][j] == 0 and len(possible[i][j]) < min_choices:
                    min_choices = len(possible[i][j])
                    best_cell = (i, j)
        
        if best_cell is None:
            return True  # Solved
        
        i, j = best_cell
        
        # Try each possible value
        for num in list(possible[i][j]):
            board[i][j] = num
            old_possible = [row[:] for row in possible]
            
            if propagate_constraints(board, possible, i, j, num):
                if backtrack():
                    return True
            
            board[i][j] = 0
            possible[:] = old_possible
        
        return False
    
    return backtrack()

# Most constrained first: Huge pruning improvement
# Random order: ~100,000 states
# Most constrained: ~1,000 states (100x faster)
```

### Problem-Solving Strategy

When encountering new backtracking problem:

1. **Understand completely**: Work through small example by hand
2. **Identify structure**: What are states? What are choices?
3. **Start simple**: Implement without optimizations first
4. **Test thoroughly**: Edge cases, small inputs, duplicates
5. **Optimize**: Add pruning based on constraints
6. **Measure**: Time your solution on different inputs

### Common Anti-Patterns to Avoid

❌ **Premature optimization**: Implement correctly first
❌ **Over-complicated state**: Keep only what's needed
❌ **Missing base case**: Always handle solution-complete state
❌ **Forgetting to copy**: Shared state leads to bugs
❌ **No pruning**: Backtracking without pruning is often too slow

## Further Learning

The framework and patterns above provide a systematic approach to solve any backtracking problem. For additional perspectives:


- **Alternative Explanations**: External resources may present different mental models or problem-solving strategies
- **More Practice Problems**: The best way to master backtracking is solving many problems
- **Advanced Topics**: Constraint satisfaction problems (CSP) and intelligent backtracking with conflict-directed backjumping

Remember: Understanding the *process* (choose, explore, unchoose) is more important than memorizing solutions.

## Practice on LeetCode

- [46. Permutations](https://leetcode.com/problems/permutations/)
- [78. Subsets](https://leetcode.com/problems/subsets/)
- [17. Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/)
