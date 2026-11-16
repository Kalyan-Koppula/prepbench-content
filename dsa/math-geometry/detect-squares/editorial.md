**Key insight:** an axis-aligned square through the query point is pinned down by one more corner — either the diagonal corner, or the corner sharing the query's `x`. Count copies of the other two corners with a hash map and multiply.

## Approach

1. `add`: increment a count for `(x, y)` in a map keyed by `x * 1001 + y`, and also in a per-column map `x -> (y -> count)`.
2. `count(qx, qy)`: for each stored `y` in column `qx` (with `y !== qy`), the side is `d = y - qy`. The square extends left or right: try `x = qx - d` and `x = qx + d`.
3. For each, add `copies(qx, y) * copies(x, qy) * copies(x, y)` — every combination of duplicate points is a distinct square.

The common alternative iterates over every stored point as the **diagonal** corner `(x, y)` with `|x - qx| === |y - qy| > 0`, then multiplies by `copies(qx, y) * copies(x, qy)`. Same idea; the column version just visits fewer candidates.

## Complexity

- `add`: `O(1)`.
- `count`: `O(c)` where `c` is the number of distinct `y` values in the query's column (at most the number of distinct stored points).
- Space `O(k)` for `k` distinct points.

## Pitfalls

- Duplicates multiply: two copies of a corner double the count. Storing a `Set` of points loses this.
- Zero-area "squares" when `d === 0` must be skipped.
- Encoding keys as `` `${x},${y}` `` strings works but is slower; `x * 1001 + y` is collision-free for coordinates `<= 1000`.
