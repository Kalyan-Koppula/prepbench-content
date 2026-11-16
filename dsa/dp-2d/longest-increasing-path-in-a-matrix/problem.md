---
title: Longest Increasing Path in a Matrix
difficulty: Hard
order: 11
lists: [neetcode150]
tags: [dp, dfs, memoization, topological-sort]
leetcode: longest-increasing-path-in-a-matrix
function: longestIncreasingPath
params:
  - { name: matrix, type: "number[][]" }
returns: number
hints:
  - A strictly increasing path can never revisit a cell, so there are no cycles — the cells form a DAG.
  - "`len(cell)` = 1 + max `len(neighbour)` over larger neighbours. The answer from a cell never changes, so memoise it."
  - Run the memoised DFS from every cell and take the maximum.
complexity: { time: "O(m · n)", space: "O(m · n)" }
---

Given an `m × n` integer `matrix`, return the number of cells on the longest path whose values are **strictly increasing** from one cell to the next.

From a cell you may move up, down, left or right to an adjacent cell inside the matrix (no diagonal moves, no wrapping around the edges). A single cell is a path of length `1`.

## Constraints

- `1 <= m, n <= 200`
- `0 <= matrix[i][j] <= 2^31 - 1`
