---
title: Minimum Path Sum
difficulty: Medium
order: 2
lists: [striver]
tags: [dp, grid]
leetcode: minimum-path-sum
function: minPathSum
params:
  - { name: grid, type: "number[][]" }
returns: number
hints:
  - You can only enter a cell from above or from the left.
  - "`best[i][j] = grid[i][j] + min(best[i-1][j], best[i][j-1])`; the first row and column have only one option."
  - A single row array is enough.
complexity: { time: "O(m · n)", space: "O(n)" }
---

`grid` is an `m × n` matrix of non-negative integers. Starting at the top-left cell and moving only **right** or **down** one cell at a time, travel to the bottom-right cell.

The cost of a route is the sum of every cell it visits, including the start and the end. Return the smallest possible cost.

## Constraints

- `1 <= m, n <= 200`
- `0 <= grid[i][j] <= 200`
