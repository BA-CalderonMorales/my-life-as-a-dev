# Skill: Encode Fix Intent in Functions

## When to Use
- When a user asks to clean up implementation so the intent is obvious to maintainers
- When noisy comments are being replaced with self-describing functions
- When a fix needs an explicit wrapper around recovery or guard logic
- When you need to align source and built outputs for clarity

## Steps
1. Identify the behavioral fix that needs an explicit name (recovery, reinit, guard, retry).
2. Create a small function whose name explains the intent and wrap the fix logic inside it.
3. Keep the wrapper focused: no side effects beyond the fix behavior it describes.
4. Remove redundant or low-value comments that the function name now replaces.
5. Apply the same pattern to built output if the repo keeps generated assets in sync.
6. Recheck that the behavior still works after the refactor.

## Checklist
- [ ] The fix logic is wrapped in a clearly named function
- [ ] No noisy or redundant comments remain
- [ ] Source and built files are consistent
- [ ] Behavior remains correct after refactor
