**Key idea:** keep four boundaries: `top`, `bottom`, `left`, `right`. Read the top row left to right, then the right column downward, then the bottom row right to left, then the left column upward. After each side, move that boundary inward. Stop when the boundaries cross.

## Recognising the pattern

Traversing a matrix in a fixed geometric order is index bookkeeping from the [Math & Geometry](/problems/patterns/math-geometry) sheet. Boundaries describe the unread part of the matrix as a shrinking rectangle, which avoids any "visited" marks.

## Alternative: simulate the walk (shown below)

Walk right; whenever the next cell is outside the matrix or already visited, turn clockwise. Stop after `m · n` cells. That is the reference brute force below. `O(m · n)` time like the boundary method, but it needs an `m × n` visited array.

## Shrinking boundaries

1. `top = 0`, `bottom = m − 1`, `left = 0`, `right = n − 1`.
2. While `top ≤ bottom` and `left ≤ right`:
   1. Top row, `left → right`; then `top++`.
   2. Right column, `top → bottom`; then `right--`.
   3. If `top ≤ bottom`: bottom row, `right → left`; then `bottom--`.
   4. If `left ≤ right`: left column, `bottom → top`; then `left++`.

**Why the two checks.** When only one row or one column remains, steps 1 and 2 already read it. Without the checks, steps 3 and 4 would read it again backwards.

## Walkthrough

`matrix = [[1, 2, 3, 4], [5, 6, 7, 8]]`

| side | read | boundaries after |
| --- | --- | --- |
| top row | 1, 2, 3, 4 | top = 1 |
| right column | 8 | right = 2 |
| bottom row (1 ≤ 1) | 7, 6, 5 | bottom = 0 |
| left column (0 ≤ 2) | nothing (bottom < top) | left = 1 |

`top > bottom`, stop. Answer `[1, 2, 3, 4, 8, 7, 6, 5]`.

## Complexity

- Both approaches: `O(m · n)` time.
- Boundaries: `O(1)` extra space beyond the output. Simulation: `O(m · n)` for the visited array.

## Edge cases

- A single row: read left to right.
- A single column: read top to bottom (the case the checks protect).
- `1 × 1`: one element.

## Common mistakes

- Missing the `top ≤ bottom` and `left ≤ right` checks, which duplicates the middle row or column.
- Updating a boundary before finishing the side that uses it.
- Off-by-one in the loop ranges of the inner sides.

## In the interview

- Draw a `3 × 4` example with the four boundaries; the code follows directly.
- Likely follow-ups:
  - *Fill a matrix in spiral order (Spiral Matrix II)?* The same loops, writing `1, 2, 3, …` instead of reading.
  - *Counter-clockwise?* Read the left column first, then the bottom row, and so on.
