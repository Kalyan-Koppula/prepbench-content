**Key insight:** the cheapest route into a cell is that cell's cost plus the cheaper of the two cells you could have come from (above or left).

## Approach

- **State:** `best[i][j]` = minimum cost of a route from `(0, 0)` to `(i, j)`, including both ends.
- **Recurrence:** `best[i][j] = grid[i][j] + min(best[i - 1][j], best[i][j - 1])`.
- **Base cases:** `best[0][0] = grid[0][0]`; first row accumulates from the left, first column from above (only one way in).
- **Order:** row by row, left to right. Answer `best[m - 1][n - 1]`.
- **Space optimisation:** keep one array of length `n`. Before updating, `best[j]` is the value from the row above and `best[j - 1]` is already this row's left neighbour.

Progression: recursion over both moves is `O(2^(m+n))`; memoise on `(i, j)`; tabulate; shrink to one row (or reuse `grid` itself if mutation is allowed — say so before doing it).

## Complexity

- Time `O(m · n)`.
- Space `O(n)`.

## Alternatives to mention

- Dijkstra works too (costs are non-negative) but is `O(mn log mn)` — overkill when moves only go right/down, because the grid is already a DAG in row-major order.

## Pitfalls

- Treating out-of-grid neighbours as `0` instead of `Infinity` lets the first row/column "come from" outside for free.
- Forgetting to include the starting cell's cost.
