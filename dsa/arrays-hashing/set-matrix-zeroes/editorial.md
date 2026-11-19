**Key idea:** first record which rows and columns contain a zero, then clear them. The record can live in two small arrays, or, for constant space, in the matrix's own first row and first column, as long as you remember separately whether those two need clearing.

## Recognising the pattern

The trap is clearing as you scan. A newly written zero looks exactly like an original one and would wipe out more rows and columns than it should. So the work splits into **mark** and **apply**, the "record first, act later" idea that runs through the [Arrays & Hashing](/problems/patterns/arrays-hashing) sheet. The follow-up is about where to keep the marks.

## Brute force

Copy the matrix. For each zero in the **copy**, zero its whole row and column in the original. That is the reference brute force below.

It is correct because the decisions come from the untouched copy. Time `O(m · n · (m + n))`, since each zero clears a row and a column. Space `O(m · n)` for the copy.

## Better: row and column flags

Two boolean arrays, `zeroRow` of length `m` and `zeroCol` of length `n`.

1. Scan once: for each zero at `(r, c)`, set `zeroRow[r]` and `zeroCol[c]`.
2. Scan again: set `matrix[r][c] = 0` if `zeroRow[r]` or `zeroCol[c]`.

Time `O(m · n)`, space `O(m + n)`. This is the answer most interviews accept.

## Optimal: use the first row and column as the flags

Row 0 can hold the column flags and column 0 can hold the row flags. The only conflict is that row 0 and column 0 are also real data, so check them first.

1. Record `firstRowHasZero` and `firstColHasZero` by scanning row 0 and column 0.
2. For every cell `(r, c)` with `r ≥ 1` and `c ≥ 1`: if it is 0, set `matrix[r][0] = 0` and `matrix[0][c] = 0`.
3. For every cell `(r, c)` with `r ≥ 1` and `c ≥ 1`: if `matrix[r][0]` or `matrix[0][c]` is 0, set the cell to 0.
4. If `firstRowHasZero`, zero row 0. If `firstColHasZero`, zero column 0.

**Why clear the markers last?** Rows 1.. and columns 1.. read their instructions from row 0 and column 0. If you cleared row 0 first, every column would look marked and the whole grid would be wiped.

## Walkthrough

```
1 1 1        1 0 1        1 0 1
1 0 1   →    0 0 1   →    0 0 0
1 1 1        1 1 1        1 0 1
(input)      (marks)      (applied)
```

| step | detail |
| --- | --- |
| first row / col | no zeros in row 0 or column 0, so both flags are false |
| mark | the zero at (1, 1) sets `matrix[1][0] = 0` and `matrix[0][1] = 0` |
| apply | row 1 is marked, so cells (1, 2) become 0; column 1 is marked, so (2, 1) becomes 0 |
| clear markers | both flags false, so row 0 and column 0 keep only their marks |

Result: `[[1,0,1],[0,0,0],[1,0,1]]`.

## Complexity

- Copy: time `O(m · n · (m + n))`, space `O(m · n)`.
- Flag arrays: time `O(m · n)`, space `O(m + n)`.
- In-place markers: time `O(m · n)`, a few passes. Space `O(1)`, two booleans.

## Edge cases

- A zero in the top-left corner: it sets both `firstRowHasZero` and `firstColHasZero`.
- A single row or a single column: the marker logic still works, because steps 2 and 3 simply don't run.
- No zeros: nothing changes.
- Every cell zero: everything stays zero.

## Common mistakes

- Clearing during the first scan, so new zeros spread.
- Clearing row 0 or column 0 before applying the marks to the inner cells.
- Using one shared flag for the corner cell `(0, 0)` without noticing that it serves both row 0 and column 0. Separate booleans avoid that.
- Treating a mark of 0 in row 0 as "this column had an original zero" for the **first row itself**.

## In the interview

- Say why clearing during the scan is wrong. That shows you understand the problem.
- Give the `O(m + n)` flags solution, then offer the constant-space version if asked.
- Likely follow-ups:
  - *Sparse matrix with few zeros?* Store the zero positions in two sets and clear only those rows and columns.
  - *Game of Life style updates?* The same "mark, then apply" idea, often encoding the old and new state in one cell.
