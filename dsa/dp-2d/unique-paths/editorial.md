**Key insight:** every route into a cell arrives from the cell above or the cell to the left, so the route count is the sum of those two counts.

## Approach

- **State:** `paths[i][j]` = number of routes from `(0, 0)` to `(i, j)`.
- **Recurrence:** `paths[i][j] = paths[i - 1][j] + paths[i][j - 1]`.
- **Base cases:** the whole first row and first column are `1` — only one straight route reaches them.
- **Order:** row by row, left to right; answer `paths[m - 1][n - 1]`.
- **Space optimisation:** row `i` reads only row `i - 1` and its own left neighbour. A single array works: before the update `row[j]` still holds the value from above, and `row[j - 1]` already holds the new left value, so `row[j] += row[j - 1]`.

Progression: recursion `f(i, j) = f(i - 1, j) + f(i, j - 1)` is exponential; memoising gives `O(m · n)`; tabulate; collapse to one row.

## Complexity

- Time `O(m · n)`.
- Space `O(n)` (or `O(min(m, n))` by swapping dimensions).

## Alternatives to mention

- **Combinatorics:** a route is a sequence of `m - 1` downs and `n - 1` rights, so the answer is `C(m + n - 2, m - 1)` — `O(min(m, n))` time. Compute it incrementally (`result = result * (top) / i`) to avoid huge factorials; each partial product is itself a binomial coefficient, so the division is exact.

## Follow-ups

- **Obstacles** (Unique Paths II): set `paths = 0` on blocked cells; the first row/column stop being all `1` after a block.
- Minimum-cost route instead of count → Minimum Path Sum, same table with `min` and `+ cost`.
