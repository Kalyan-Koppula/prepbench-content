---
title: Max Area of Island
difficulty: Medium
order: 3
lists: [neetcode150]
tags: [dfs, bfs, matrix]
leetcode: max-area-of-island
function: maxAreaOfIsland
params:
  - { name: grid, type: "number[][]" }
returns: number
hints:
  - This is Number of Islands, but each flood fill should also report how many cells it visited.
  - Keep a running maximum over all islands; return `0` if there is no land.
complexity: { time: "O(m · n)", space: "O(m · n)" }
---

You're given an `m x n` binary matrix `grid` where `1` is land and `0` is water. An island is a group of land cells connected horizontally or vertically, and its **area** is the number of cells in it.

Return the largest area of any island, or `0` if the grid has no land.

## Constraints

- `1 <= m, n <= 50`
- `grid[r][c]` is `0` or `1`
