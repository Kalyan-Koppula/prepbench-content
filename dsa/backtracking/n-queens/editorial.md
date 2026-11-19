**Key idea:** every row holds exactly one queen, so place queens row by row. For each row, try each column that isn't attacked, recurse to the next row, and undo. Track used columns and both diagonal directions in arrays, so each "is this square attacked?" check is `O(1)`. A diagonal going down-right keeps `row − col` constant; one going down-left keeps `row + col` constant.

## Recognising the pattern

A classic constraint puzzle from the [Backtracking](/problems/patterns/backtracking) sheet. Choosing one queen per row builds the row constraint into the search, and the column and diagonal sets prune every attacked square before recursing.

## Brute force

Since each row and each column has one queen, a placement is a permutation of columns. Generate all `n!` permutations and keep those where no two queens share a diagonal (`|col_i − col_j| == |i − j|`). That is the reference brute force below. It only checks diagonals at the end, so it builds many hopeless boards: `O(n! · n²)`.

## Backtracking with constraint arrays

State:

- `queenCol[r]`: the column of the queen in row `r`.
- `colUsed[c]`, `diagUsed[r − c + n]`, `antiUsed[r + c]`: whether a column or diagonal already has a queen. The `+ n` keeps the index non-negative.

`place(r)`:

1. If `r == n`, every row has a queen: build the board strings and record them.
2. For each column `c`: if the column or either diagonal is used, skip. Otherwise mark all three, set `queenCol[r] = c`, call `place(r + 1)`, then unmark.

Rows are never shared because each call handles a new row.

## Walkthrough

`n = 4`. The search finds:

| row 0 | row 1 | row 2 | row 3 | result |
| --- | --- | --- | --- | --- |
| col 0 | col 2 | stuck (all attacked) | | back up |
| col 0 | col 3 | col 1 | stuck | back up |
| col 1 | col 3 | col 0 | col 2 | record `.Q..`, `...Q`, `Q...`, `..Q.` |
| col 2 | col 0 | col 3 | col 1 | record `..Q.`, `Q...`, `...Q`, `.Q..` |
| col 3 | … | | | no more solutions |

Two solutions for `n = 4`.

## Complexity

- Brute force: `O(n! · n²)`.
- Backtracking: bounded by `O(n!)` placements, far fewer in practice thanks to pruning. Building each solution's strings costs `O(n²)`. Space `O(n)` for the arrays and recursion.

## Edge cases

- `n = 1`: one solution, `["Q"]`.
- `n = 2` and `n = 3`: no solutions.
- Larger `n`: the number of solutions grows quickly (92 for `n = 8`).

## Common mistakes

- Checking only the column and missing the diagonals.
- Using `r − c` as an array index without an offset, which goes negative.
- Forgetting to unmark the column or diagonals when backtracking.

## In the interview

- Explain the diagonal identities (`r − c` and `r + c`) before coding; they are the key to `O(1)` checks.
- Likely follow-ups:
  - *Count the solutions only (N-Queens II)?* Same search, increment a counter instead of building boards.
  - *Faster?* Bitmasks for columns and diagonals, and symmetry (solve half the first row and mirror).
