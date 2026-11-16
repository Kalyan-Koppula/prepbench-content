**Key insight:** classic constraint backtracking — place a legal digit in an empty cell, recurse, undo on failure. Make the legality check O(1) with per-row, per-column and per-box bitmasks.

## Approach

1. Scan the board once: record each empty cell, and set bit `d` in `rows[r]`, `cols[c]`, `boxes[b]` for each given digit `d`. The box index is `3 * floor(r / 3) + floor(c / 3)`.
2. `solve(k)` fills the `k`-th empty cell:
   - If `k` equals the number of empty cells, the board is complete — return `true`.
   - `used = rows[r] | cols[c] | boxes[b]`. For each digit whose bit isn't in `used`: set the bits, write the digit, recurse. If the recursion succeeds, return `true` immediately; otherwise clear the bits and try the next digit.
   - If no digit works, reset the cell and return `false` so the caller backtracks.

## Complexity

- Worst case `O(9^E)` for `E` empty cells — exponential, but the constraints prune almost everything for real puzzles.
- Space `O(E)` recursion depth plus the 27 masks.

## Improvements to mention

- **Most-constrained cell first (MRV):** at each step pick the empty cell with the fewest legal digits (`9 - popcount(used)`). If any cell has zero options, backtrack immediately. This is often orders of magnitude faster on hard puzzles.
- **Constraint propagation:** fill "naked singles" (cells with one option) before guessing.
- Exact cover with Dancing Links (Algorithm X) is the heavy-duty approach — worth naming, rarely expected in code.

## Pitfalls

- Returning on the first digit tried without checking whether the recursion succeeded.
- Forgetting to undo the masks (and the cell) when a branch fails.
- Rescanning the whole board for the next empty cell on every call — precompute the list.
