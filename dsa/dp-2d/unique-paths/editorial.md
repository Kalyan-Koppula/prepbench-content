**Key idea:** the only ways into cell `(i, j)` are from the cell above and the cell to the left. So the number of routes to `(i, j)` is the routes to `(i − 1, j)` plus the routes to `(i, j − 1)`. The first row and first column have exactly one route each. Fill the grid row by row; the bottom-right cell is the answer.

## Recognising the pattern

Counting paths through a grid with moves only right and down is the starting point of grid DP in the [2-D Dynamic Programming](/problems/patterns/dp-2d) sheet. Each cell's value depends only on cells already filled when you scan top to bottom, left to right.

## Alternative: combinatorics (shown below)

Every route makes exactly `m − 1` down moves and `n − 1` right moves, in some order. A route is fixed by choosing which of the `m + n − 2` moves are the downs, so the count is `C(m + n − 2, m − 1)`. The reference brute force below builds that binomial coefficient one factor at a time, so every intermediate value is itself a binomial coefficient and stays a whole number. `O(min(m, n))` time.

Plain recursion without memoisation, `routes(i, j) = routes(i − 1, j) + routes(i, j − 1)`, is exponential.

## Grid DP

1. `paths[i][j] = 1` for every cell in row 0 or column 0.
2. For every other cell, in row-major order: `paths[i][j] = paths[i − 1][j] + paths[i][j − 1]`.
3. Return `paths[m − 1][n − 1]`.

**One row is enough.** Row `i` reads only row `i − 1` and itself. Keep a single array `row`, initially all 1s, and update `row[j] += row[j − 1]` from left to right: before the update `row[j]` still holds the value from above, and `row[j − 1]` already holds the new value from the left. That gives `O(n)` space.

## Walkthrough

`m = 3`, `n = 3`

|  | col 0 | col 1 | col 2 |
| --- | --- | --- | --- |
| row 0 | 1 | 1 | 1 |
| row 1 | 1 | 1 + 1 = 2 | 1 + 2 = 3 |
| row 2 | 1 | 2 + 1 = 3 | 3 + 3 = 6 |

Answer `6`, which matches `C(4, 2) = 6`.

## Complexity

- Plain recursion: exponential.
- Grid DP: `O(m · n)` time, `O(m · n)` space, or `O(n)` with one row.
- Combinatorics: `O(min(m, n))` time, `O(1)` space.

## Edge cases

- `1 × 1`: one route (already there).
- A single row or column: one route.
- Large grids: the answer can approach `2 · 10^9`, still exact in a double or a 64-bit integer.

## Common mistakes

- Initialising the first row and column to 0, which makes everything 0.
- Computing the binomial with full factorials, which overflow long before the answer does.
- Updating the single-row version from right to left, which reads the wrong neighbour.

## In the interview

- Start with the recurrence, then mention the one-row optimisation and the formula.
- Likely follow-ups:
  - *Obstacles in the grid (Unique Paths II)?* Cells with an obstacle hold 0; the rest of the recurrence is unchanged.
  - *Minimum cost instead of count?* Replace `+` with `min` and add the cell's cost (Minimum Path Sum).
  - *Diagonal moves allowed too?* Add `paths[i − 1][j − 1]` to the sum.
