**Key insight:** read row by row, the matrix is a single sorted array of length `m * n`. Binary search over flat indices and map each one back with `row = k / n`, `col = k % n`.

## Approach

1. `lo = 0`, `hi = m * n - 1`.
2. For `mid`, read `matrix[Math.floor(mid / n)][mid % n]` and compare with `target` exactly as in plain binary search.
3. Return `true` on a hit, `false` once the window is empty.

## Complexity

- Time `O(log(m * n))` — one binary search over all cells.
- Space `O(1)` — no flattening, just index arithmetic.

## Alternatives to mention

- Two binary searches: first find the last row whose first element is `<= target`, then search inside that row. Same `O(log m + log n)`, slightly more code.
- Staircase walk from the top-right corner (`O(m + n)`): move left if the value is too big, down if too small. That's the right tool for the *weaker* variant where only rows and columns are sorted independently (Search a 2D Matrix II) — worth naming the difference.

## Pitfalls

- Using `m` instead of `n` in the index mapping. The divisor is the **row length**.
- Copying the matrix into a flat array costs `O(m * n)` and defeats the point.
