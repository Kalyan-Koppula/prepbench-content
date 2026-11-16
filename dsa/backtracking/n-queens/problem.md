---
title: N-Queens
difficulty: Hard
order: 10
lists: [neetcode150, striver]
tags: [backtracking, matrix]
leetcode: n-queens
function: solveNQueens
params:
  - { name: n, type: number }
returns: "string[][]"
compare: unordered
hints:
  - Every row holds exactly one queen, so place them row by row and only choose the column.
  - "A square `(r, c)` is attacked if its column, its `r - c` diagonal or its `r + c` anti-diagonal is already taken. Track those three in sets for O(1) checks."
complexity: { time: "O(n!)", space: "O(n)" }
---

Place `n` chess queens on an `n x n` board so that no two attack each other — no two share a row, a column, or a diagonal.

Return every distinct placement. Each placement is a list of `n` strings, one per row from top to bottom, where `"Q"` marks a queen and `"."` an empty square. The placements may be listed in any order.

## Constraints

- `1 <= n <= 9`
