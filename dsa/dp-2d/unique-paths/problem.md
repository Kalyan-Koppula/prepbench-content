---
title: Unique Paths
difficulty: Medium
order: 1
lists: [neetcode150, striver]
tags: [dp, grid, combinatorics]
leetcode: unique-paths
function: uniquePaths
params:
  - { name: m, type: number }
  - { name: n, type: number }
returns: number
hints:
  - The only ways into cell `(i, j)` are from above and from the left.
  - "`paths[i][j] = paths[i-1][j] + paths[i][j-1]`, and the first row and column are all `1`."
  - One row of length `n` is enough if you update it in place left to right.
complexity: { time: "O(m · n)", space: "O(n)" }
---

A robot stands in the top-left cell of an `m × n` grid and wants to reach the bottom-right cell. Each move takes it exactly one cell **right** or one cell **down**.

Return the number of distinct routes it can take.

## Constraints

- `1 <= m, n <= 100`
- The answer is at most `2 * 10^9`.
