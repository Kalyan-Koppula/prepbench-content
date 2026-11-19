**Key idea:** a board is valid when no digit appears twice in any row, any column or any 3×3 box. Scan the cells once and remember, for each row, column and box, which digits you've already seen. The first repeat means the board is invalid.

## Recognising the pattern

This is duplicate detection, the same "have I seen this before?" question as Contains Duplicate, but within **27 groups at once**: 9 rows, 9 columns and 9 boxes. Each cell belongs to exactly one of each. Keeping a small "seen" table per group is the hashing move from the [Arrays & Hashing](/problems/patterns/arrays-hashing) sheet. The only real puzzle is computing which box a cell belongs to.

## Brute force

Compare every pair of filled cells. If two cells hold the same digit and share a row, a column or a box, return `false`.

It is correct because a rule violation is exactly such a pair. There are at most 81 cells, so this is at most 81 × 81 ≈ 6,500 comparisons. On a fixed 9×9 board that is fast, but it is quadratic in the number of cells and doesn't show the idea interviewers look for.

## Optimal: one pass with seen-tables

1. Create three tables, `seenRow`, `seenCol` and `seenBox`, each with 9 rows of 10 booleans (index 1 to 9 for the digits).
2. For each cell `(r, c)` that isn't `"."`:
   1. Convert the character to a digit `d`.
   2. Compute the box index `b = floor(r / 3) * 3 + floor(c / 3)`.
   3. If `d` is already marked in `seenRow[r]`, `seenCol[c]` or `seenBox[b]`, return `false`.
   4. Otherwise mark `d` in all three.
3. Return `true`.

**The box formula.** `floor(r / 3)` is the box's row band (0, 1 or 2) and `floor(c / 3)` is its column band. Multiplying the band row by 3 and adding the band column numbers the boxes 0 to 8, left to right and top to bottom:

```
 0 | 1 | 2
---+---+---
 3 | 4 | 5
---+---+---
 6 | 7 | 8
```

Cell `(4, 7)` is in band row 1 and band column 2, so box `1 * 3 + 2 = 5`.

Sets of strings work just as well as boolean arrays. The arrays make the fixed size obvious and avoid hashing.

## Walkthrough

Take the filled cells of a board in scan order and suppose row 0 contains `5 3 . . 7` and cell `(1, 0)` is `6`, then cell `(2, 1)` is `5`:

| cell | digit | box | row seen | col seen | box seen | result |
| --- | --- | --- | --- | --- | --- | --- |
| (0,0) | 5 | 0 | {} | {} | {} | mark |
| (0,1) | 3 | 0 | {5} | {} | {5} | mark |
| (0,4) | 7 | 1 | {5,3} | {} | {} | mark |
| (1,0) | 6 | 0 | {} | {5} | {5,3} | mark |
| (2,1) | 5 | 0 | {} | {3} | {5,3,6} | **5 already in box 0 → false** |

## Complexity

- Brute force: time `O(k²)` for `k` filled cells, at most 81² on this board. Space `O(1)`.
- Seen-tables: time `O(k)`, one check and three marks per filled cell. Space `O(1)`: three tables of fixed size. For a general `N×N` board it is `O(N²)` time and `O(N²)` space.

## Edge cases

- An empty board: nothing to check, so it is valid.
- A board that is valid but unsolvable: still `true`. The question only asks about repeats among filled cells.
- The same digit in two different boxes of the same band: it may still clash on a row or column, which the separate tables catch.

## Common mistakes

- Box index `r / 3 + c / 3` without the `* 3`, which maps different boxes to the same number.
- Forgetting `Math.floor`, so `r / 3` is a fraction and the index is wrong.
- Checking whether the board is **solvable**, which is a much harder problem and not what was asked.
- Treating `"."` as a digit.

## In the interview

- Confirm the rules: only filled cells count, and solvability doesn't matter.
- Describe the three kinds of groups and the box formula, then the single pass.
- Likely follow-ups:
  - *Fewer data structures?* One set of strings such as `"5 in row 0"`, `"5 in col 4"`, `"5 in box 1"` does all three checks.
  - *Bit masks?* Store each group as a 9-bit integer and test `mask & (1 << d)`. Same complexity, less memory.
  - *Solve the Sudoku?* Backtracking with the same three tables to check candidates in `O(1)`.
