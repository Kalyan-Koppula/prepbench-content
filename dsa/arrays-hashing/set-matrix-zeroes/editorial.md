**Key insight:** first *record* which rows and columns contain a zero, then clear them — and the first row and first column can store those records themselves, as long as you remember separately whether they had zeros originally.

## Approach

1. Note whether row 0 contains a zero (`firstRowZero`) and whether column 0 does (`firstColZero`).
2. For every cell `(r, c)` with `r, c >= 1` that is zero, mark `matrix[r][0] = 0` and `matrix[0][c] = 0`.
3. For every cell `(r, c)` with `r, c >= 1`, set it to zero if `matrix[r][0] === 0` or `matrix[0][c] === 0`.
4. Finally clear row 0 if `firstRowZero`, and column 0 if `firstColZero`.

The order matters: the marker row and column are cleared last, otherwise their zeros would wipe the whole matrix.

## Complexity

- Time `O(m · n)` — a constant number of passes over the grid.
- Space `O(1)` — two booleans.

## Alternatives to mention

- Copy the matrix and read zeros from the copy: `O(m · n)` space.
- Two boolean arrays `zeroRow[m]` and `zeroCol[n]`: `O(m + n)` space, simplest correct answer — write this first if time is tight.

## Pitfalls

- Zeroing during the scan cascades: one zero ends up erasing everything to its right and below.
- `matrix[0][0]` is shared by row 0 and column 0 — that's why one of them needs its own flag.
