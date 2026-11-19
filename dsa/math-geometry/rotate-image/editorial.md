**Key idea:** a 90° clockwise rotation sends cell `(r, c)` to `(c, n − 1 − r)`. That move is two simple reflections in a row: **transpose** (swap across the main diagonal, `(r, c) → (c, r)`), then **reverse each row** (`(c, r) → (c, n − 1 − r)`). Both are in-place swaps, so no extra matrix is needed.

## Recognising the pattern

Matrix transformations in place are index arithmetic, from the [Math & Geometry](/problems/patterns/math-geometry) sheet. The trick is to write down where `(r, c)` goes, then split that mapping into steps that are each easy to do with swaps.

## Alternative: copy, then place (shown below)

Copy the matrix, then write each value to its new position: `matrix[c][n − 1 − r] = copy[r][c]`. That is the reference brute force below. `O(n²)` time and `O(n²)` extra space, which the problem forbids, but it is the clearest statement of the mapping.

## Transpose, then reverse rows

1. For each `i`, for each `j > i`: swap `matrix[i][j]` and `matrix[j][i]`.
2. For each row: reverse it with two pointers.

**Why `j > i`.** Swapping every pair twice would undo the transpose. Only the cells above the diagonal are swapped, each with its mirror below.

**The other rotations.** Counter-clockwise: transpose, then reverse each **column** (or reverse rows first, then transpose). 180°: reverse each row and reverse the row order.

## Walkthrough

`matrix = [[2, 4, 6], [8, 10, 12], [14, 16, 18]]`

| step | matrix |
| --- | --- |
| start | [2, 4, 6] / [8, 10, 12] / [14, 16, 18] |
| transpose | [2, 8, 14] / [4, 10, 16] / [6, 12, 18] |
| reverse rows | [14, 8, 2] / [16, 10, 4] / [18, 12, 6] |

The left column, read bottom to top (14, 8, 2), is now the top row, as a clockwise turn requires.

## Complexity

- Copy and place: `O(n²)` time, `O(n²)` space.
- Transpose and reverse: `O(n²)` time, `O(1)` space.
- Rotating four cells at a time, ring by ring: also `O(n²)` and `O(1)`, with trickier indices.

## Edge cases

- `1 × 1`: unchanged.
- `2 × 2`: the transpose swaps one pair; reversing swaps two.
- Odd `n`: the centre cell stays put.

## Common mistakes

- Transposing with `j` from 0, which swaps every pair twice.
- Reversing columns instead of rows, which rotates the other way.
- Writing into the matrix while still reading from it in the direct mapping, without a copy.

## In the interview

- Write the mapping `(r, c) → (c, n − 1 − r)` first, then show the two reflections compose to it.
- Likely follow-ups:
  - *Counter-clockwise?* Transpose, then reverse each column.
  - *Non-square matrix?* An in-place rotation isn't possible (the shape changes); build a new `n × m` matrix.
  - *Four-way cycle version?* For each ring and offset, rotate the four corresponding cells with one temporary variable.
