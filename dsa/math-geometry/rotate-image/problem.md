---
title: Rotate Image
difficulty: Medium
order: 3
lists: [neetcode150, striver]
tags: [matrix, in-place]
leetcode: rotate-image
function: rotate
params:
  - { name: matrix, type: "number[][]" }
mutates: 0
hints:
  - Rotating clockwise sends row `i` to column `n - 1 - i`. Can you get there with two simpler in-place moves?
  - "Transpose the matrix (swap across the main diagonal), then reverse every row."
complexity: { time: "O(n²)", space: "O(1)" }
---

Rotate the `n x n` matrix `matrix` by 90 degrees **clockwise**, modifying it in place. Don't allocate a second matrix.

The function returns nothing; the tests inspect `matrix` after the call.

## Constraints

- `1 <= n <= 20`, `matrix.length === matrix[i].length === n`
- `-1000 <= matrix[i][j] <= 1000`
