---
title: Surrounded Regions
difficulty: Medium
order: 6
lists: [neetcode150, striver]
tags: [dfs, bfs, matrix]
leetcode: surrounded-regions
function: solve
params:
  - { name: board, type: "string[][]" }
mutates: 0
hints:
  - Which `"O"` cells can never be captured? Think about the edge of the board.
  - Mark every `"O"` reachable from a border `"O"` as safe. Everything else that is still `"O"` gets captured.
complexity: { time: "O(m · n)", space: "O(m · n)" }
---

You're given an `m x n` board where every cell is `"X"` or `"O"`. A group of `"O"` cells connected horizontally or vertically is **captured** when none of its cells lies on the border of the board — it is completely enclosed by `"X"` cells.

Modify `board` in place, turning every cell of every captured group into `"X"`. Your function returns nothing; the board after the call is checked.

## Constraints

- `1 <= m, n <= 200`
- `board[r][c]` is `"X"` or `"O"`
