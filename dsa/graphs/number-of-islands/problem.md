---
title: Number of Islands
difficulty: Medium
order: 2
lists: [neetcode150, striver]
tags: [dfs, bfs, union-find, matrix]
leetcode: number-of-islands
function: numIslands
params:
  - { name: grid, type: "string[][]" }
returns: number
hints:
  - Scan every cell. When you hit land you haven't seen, you've found a new island.
  - Before moving on, visit (and mark) all land connected to that cell so it is never counted again.
complexity: { time: "O(m · n)", space: "O(m · n)" }
---

You're given an `m x n` map `grid` where `"1"` is land and `"0"` is water. Land cells that share an edge (horizontally or vertically) belong to the same island. Everything outside the grid is water.

Return the number of islands.

## Constraints

- `1 <= m, n <= 300`
- `grid[r][c]` is `"0"` or `"1"`
