---
title: Sudoku Solver
difficulty: Hard
order: 11
lists: [striver]
tags: [backtracking, matrix, bit-manipulation]
leetcode: sudoku-solver
function: solveSudoku
params:
  - { name: board, type: "string[][]" }
mutates: 0
hints:
  - Find an empty cell, try each digit that doesn't clash with its row, column or 3×3 box, and recurse. Undo the digit if the recursion fails.
  - Keep "digits used" per row, column and box (sets or 9-bit masks) so each clash check is O(1) instead of scanning 27 cells.
  - Filling the empty cell with the fewest legal digits first prunes the search dramatically.
complexity: { time: "O(9^E) worst case", space: "O(E)" }
---

Fill in the empty cells of a 9×9 Sudoku `board` **in place**. Empty cells hold `"."`; filled cells hold a digit `"1"`–`"9"`.

A solved board has every digit `1`–`9` exactly once in each row, each column, and each of the nine 3×3 boxes, and keeps all the original digits. Your function returns nothing; the board itself is checked afterwards.

## Constraints

- `board` is 9×9; each cell is `"."` or a digit `"1"`–`"9"`.
- The given digits don't break any rule, and the puzzle has **exactly one** solution.
