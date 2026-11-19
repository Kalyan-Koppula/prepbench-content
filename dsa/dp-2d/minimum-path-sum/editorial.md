**Key idea:** the cheapest path to cell `(i, j)` arrives either from above or from the left, so its cost is the cell's own value plus the cheaper of those two neighbours' best costs. Fill the grid row by row; the bottom-right cell holds the answer.

## Recognising the pattern

Minimising a sum along a path through a grid, moving only right and down, is grid DP from the [2-D Dynamic Programming](/problems/patterns/dp-2d) sheet: the same shape as [Unique Paths](/problems/unique-paths) with `min` instead of `+`. Because moves never go up or left, there are no cycles and no need for Dijkstra.

## Alternative: top-down recursion with memoisation (shown below)

`cheapestFrom(i, j)` = the cell's value plus the cheaper of going down or right, ending at the bottom-right cell. Without memoisation it explores every path, `C(m + n − 2, m − 1)` of them. With a memo table each cell is solved once. That is the reference brute force below: same `O(m · n)`, with recursion depth `m + n`.

## Bottom-up table

1. `cost[0][0] = grid[0][0]`.
2. First row: `cost[0][j] = cost[0][j − 1] + grid[0][j]` (only reachable from the left).
3. First column: `cost[i][0] = cost[i − 1][0] + grid[i][0]` (only from above).
4. Everything else: `cost[i][j] = grid[i][j] + min(cost[i − 1][j], cost[i][j − 1])`.
5. Return `cost[m − 1][n − 1]`.

As with Unique Paths, one row of size `n` is enough: before updating `best[j]` it holds the value from above, and `best[j − 1]` already holds the value from the left.

## Walkthrough

`grid = [[1, 4, 2], [3, 1, 5], [6, 2, 1]]`

|  | col 0 | col 1 | col 2 |
| --- | --- | --- | --- |
| row 0 | 1 | 1 + 4 = 5 | 5 + 2 = 7 |
| row 1 | 1 + 3 = 4 | 1 + min(5, 4) = 5 | 5 + min(7, 5) = 10 |
| row 2 | 4 + 6 = 10 | 2 + min(5, 10) = 7 | 1 + min(10, 7) = 8 |

Answer `8`: down, right, down, right (1 + 3 + 1 + 2 + 1).

## Complexity

- All paths: exponential.
- Memoised recursion: `O(m · n)` time and space, plus `O(m + n)` stack.
- Table: `O(m · n)` time; `O(m · n)` space, or `O(n)` with one row.

## Edge cases

- A single row or column: one path, the sum of all cells.
- A `1 × 1` grid: that cell's value.
- Zeros in the grid: no special handling.

## Common mistakes

- Treating the first row and column like interior cells and reading out of bounds.
- Taking `min` with an uninitialised 0 neighbour, which makes paths look free.
- Reaching for Dijkstra or BFS; they work but are slower and unnecessary for right/down moves.

## In the interview

- Write the recurrence with its boundary cases, then offer the one-row version.
- Likely follow-ups:
  - *Return the path itself?* Walk back from the bottom-right, each time stepping to whichever neighbour produced the minimum.
  - *Moves in all four directions?* Cycles become possible, so use Dijkstra (non-negative costs).
  - *Modify the grid in place to save space?* Possible, but say that it destroys the input.
