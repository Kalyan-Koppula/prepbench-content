**Key idea:** fill empty cells one at a time with digits that don't already appear in that cell's row, column or box. If a cell has no valid digit left, undo the previous choice and try its next option. Keep "which digits are used" for every row, column and box in arrays, so each candidate is checked in `O(1)`.

## Recognising the pattern

Sudoku is the textbook constraint satisfaction search in the [Backtracking](/problems/patterns/backtracking) sheet. The grid is small but the search space is huge, so what matters is checking constraints cheaply and abandoning dead branches immediately. The row, column and box bookkeeping is the same as in Valid Sudoku.

## Brute force

Find the first empty cell, try digits 1–9, and check each one by scanning its row, column and box on the board. Recurse; on failure, reset the cell and try the next digit. That is the reference brute force below. It works, but each check scans 27 cells and each recursion rescans the board from the top for the next empty cell.

## Backtracking with constraint arrays

1. **Setup.** `rowHas[r][d]`, `colHas[c][d]`, `boxHas[b][d]` record which digits are already present, with box index `b = floor(r / 3) · 3 + floor(c / 3)`. Collect the empty cells into a list.
2. **`solve(k)`** fills empty cell number `k`:
   1. If `k` equals the number of empty cells, the board is complete: return `true`.
   2. For each digit `d` from 1 to 9 not used in the cell's row, column or box: mark it in all three, write it, and call `solve(k + 1)`. If that returns `true`, return `true` immediately, leaving the digits on the board.
   3. Otherwise unmark the digit and try the next.
   4. If no digit works, clear the cell and return `false`, telling the caller to change its choice.

**Why return as soon as a solution is found.** The puzzle has exactly one solution and the board must be left filled. Returning `true` up the recursion stops all further undoing.

**A big speed-up:** choose the empty cell with the **fewest** valid digits next (most constrained first) instead of a fixed order. Cells with one candidate get filled without branching, and contradictions show up early.

## Walkthrough

For a typical puzzle, the first empty cell `(0, 2)` might allow only `{1, 2, 4}` after the row, column and box are checked. The search writes `1`, continues to the next empty cell, and so on. When some later cell has no valid digit, the search returns `false` up to the most recent choice, which tries its next candidate. Because constraints are checked before writing, most wrong choices fail within a few cells.

## Complexity

- Worst case is exponential: up to `9^e` for `e` empty cells. In practice, constraint checks prune almost everything; typical puzzles solve in milliseconds.
- Each candidate check is `O(1)` with the arrays (versus `O(27)` by scanning).
- Space: `O(81)` for the arrays and the recursion depth.

## Edge cases

- Very few empty cells: almost no branching.
- Puzzles designed to defeat naive search: most-constrained-cell ordering helps a lot.
- An already-full board: `solve(0)` returns `true` immediately.

## Common mistakes

- Not undoing the marks after a failed recursive call.
- Undoing even after success, which erases the solution.
- Computing the box index incorrectly.
- Rescanning the board for the next empty cell on every call instead of keeping a list.

## In the interview

- Explain the three constraint tables first, then the search, then offer the most-constrained-cell heuristic.
- Likely follow-ups:
  - *Count all solutions?* Don't stop at the first; count every time `k` reaches the end.
  - *Generate puzzles?* Fill a board randomly with this solver, then remove digits while the solution stays unique.
  - *Even faster?* Bitmasks per row, column and box, and constraint propagation (fill forced cells before branching).
