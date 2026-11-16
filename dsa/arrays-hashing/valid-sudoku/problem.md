---
title: Valid Sudoku
difficulty: Medium
order: 7
lists: [neetcode150]
tags: [hash-set, matrix]
leetcode: valid-sudoku
function: isValidSudoku
params:
  - { name: board, type: "string[][]" }
returns: boolean
hints:
  - Only the filled cells matter — you are not asked whether the puzzle can be solved.
  - Keep one set per row, per column and per 3×3 box. Box index for cell `(r, c)` is `Math.floor(r / 3) * 3 + Math.floor(c / 3)`.
complexity: { time: "O(1)", space: "O(1)" }
---

You're given a partially filled 9×9 Sudoku grid `board`. Each cell is a digit `"1"`–`"9"` or `"."` for an empty cell.

Return `true` if the filled cells break none of these rules, and `false` otherwise:

- No digit repeats within a row.
- No digit repeats within a column.
- No digit repeats within any of the nine 3×3 boxes that tile the grid.

Empty cells are ignored, and the board does not need to be solvable to be valid.

## Constraints

- `board.length == 9` and `board[i].length == 9`
- `board[i][j]` is `"1"`–`"9"` or `"."`
