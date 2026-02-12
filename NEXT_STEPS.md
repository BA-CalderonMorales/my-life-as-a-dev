# Next Steps for Diagram Migration

## Current Status
- **Data Structures**: Completed and committed locally.
- **Algorithms (Backtracking)**: Generator code added to `scripts/python/generate_excalidraw.py` but not yet run/verified.

## Critical User Instructions
1.  **NO PUSH**: Do not push changes to remote yet.
2.  **CLEANUP**: The user does **not** want the Python generation scripts (`scripts/python/generate_excalidraw.py`, `scripts/python/kroki_convert.py`) in the final repository history.
    -   *Action*: Add these to `.gitignore` or remove them before the final push.
3.  **FIX ARROWS**: The current arrow generation logic (`add_arrow` in `generate_excalidraw.py`) causes arrows to overlap with text and nodes, making diagrams unreadable.
    -   *Action*: Modify `add_arrow` to calculate intersection points with the node boundaries instead of pointing to the center, or manually specify start/end binding points (gap/focus) to improve visual layout.

## Immediate Tasks
1.  **Refine Generator**: Update `scripts/python/generate_excalidraw.py` to fix the arrow overlap issue.
2.  **Generate Backtracking**: Run the script to generate diagrams for `docs/learning/algorithms/backtracking/index.md`.
3.  **Convert**: Run `uv run scripts/python/kroki_convert.py docs/assets/images/diagrams/algorithms`.
4.  **Update Markdown**: Replace ASCII diagrams in `docs/learning/algorithms/backtracking/index.md` with the new SVGs.
5.  **Continue Scan**: Look for more diagrams in `docs/learning/algorithms/` (e.g., Sliding Window, Two Pointers).
