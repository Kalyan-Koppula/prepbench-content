**Key idea:** because each row starts after the previous row ends, reading the matrix row by row gives one sorted list of `m · n` values. Binary search over positions `0 .. m·n − 1` and convert a position `p` to the cell `(floor(p / n), p % n)`.

## Recognising the pattern

Sorted data and an `O(log(m · n))` requirement point to the [Binary Search](/problems/patterns/binary-search) sheet. The only trick is the **index mapping**: you don't need to copy the matrix into a list, you only need to know which cell a list position refers to.

## Brute force

Check every cell. That is the reference brute force below. Time `O(m · n)`, space `O(1)`.

## Better: two binary searches

Binary search the first column to find the last row whose first value is `<= target`, then binary search that row. Time `O(log m + log n)`, which equals `O(log(m · n))`. Correct and fine; the single search is simpler to write.

## Optimal: one binary search over the flattened order

1. `lo = 0`, `hi = m · n − 1`.
2. While `lo <= hi`:
   1. `mid = lo + floor((hi − lo) / 2)`.
   2. `value = matrix[floor(mid / n)][mid % n]`.
   3. Equal: return `true`. Smaller than the target: `lo = mid + 1`. Larger: `hi = mid − 1`.
3. Return `false`.

**The mapping.** Position `p` in row-major order is in row `floor(p / n)` (each full row covers `n` positions) at column `p % n` (the remainder within that row). Note that it divides by the number of **columns**, not rows.

## Walkthrough

`matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]]`, `target = 16`, so `m = 3`, `n = 4`, positions `0..11`.

| lo | hi | mid | cell | value | next |
| --- | --- | --- | --- | --- | --- |
| 0 | 11 | 5 | (1, 1) | 11 | 11 < 16 → lo = 6 |
| 6 | 11 | 8 | (2, 0) | 23 | 23 > 16 → hi = 7 |
| 6 | 7 | 6 | (1, 2) | 16 | found |

## Complexity

- Brute force: time `O(m · n)`, space `O(1)`.
- Two searches: time `O(log m + log n)`, space `O(1)`.
- Flattened search: time `O(log(m · n))`, space `O(1)`.

## Edge cases

- A single row or a single column: the mapping still works.
- Target below the first value or above the last: the range empties at one end.
- A 1×1 matrix: one comparison.

## Common mistakes

- Mapping with `floor(p / m)` (rows) instead of `floor(p / n)` (columns).
- Applying this to a matrix that is only sorted per row and per column (Search a 2D Matrix II). There the flattened order isn't sorted.

## In the interview

- Point out the property that makes the matrix one sorted list, then the mapping.
- Likely follow-ups:
  - *Rows and columns sorted, but rows overlap (Matrix II)?* Start at the top-right corner: move left if the value is too big, down if it is too small. `O(m + n)`.
  - *Find the `k`-th smallest value in a row- and column-sorted matrix?* Binary search on the value range, counting cells `<= mid` with the staircase walk.
