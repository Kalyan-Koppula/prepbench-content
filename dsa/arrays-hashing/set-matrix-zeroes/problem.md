---
title: Set Matrix Zeroes
difficulty: Medium
order: 13
lists: [neetcode150, striver]
tags: [matrix, in-place]
leetcode: set-matrix-zeroes
function: setZeroes
params:
  - { name: matrix, type: "number[][]" }
returns: void
mutates: 0
hints:
  - If you zero cells as you find zeros, the new zeros trigger more zeroing. Record what to clear first, then clear.
  - To avoid extra arrays, use the first row and first column as the markers — but remember separately whether they themselves need clearing.
complexity: { time: "O(m · n)", space: "O(1)" }
---

You're given an `m × n` integer matrix. For every cell that is `0` in the **original** matrix, set its entire row and entire column to `0`. Modify `matrix` in place.

Your function returns nothing; the matrix itself is checked after the call.

## Constraints

- `1 <= m, n <= 200`
- `-2^31 <= matrix[i][j] <= 2^31 - 1`

**Follow-up:** an `O(m + n)` space solution is straightforward. Can you get to `O(1)` extra space?
