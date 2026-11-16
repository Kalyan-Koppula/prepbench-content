---
title: Search a 2D Matrix
difficulty: Medium
order: 2
lists: [neetcode150, striver]
tags: [binary-search, matrix]
leetcode: search-a-2d-matrix
function: searchMatrix
params:
  - { name: matrix, type: "number[][]" }
  - { name: target, type: number }
returns: boolean
hints:
  - Read the rows one after another — what does the sequence of all values look like?
  - Treat the matrix as one sorted array of length `m * n`. Which row and column does flat index `k` map to?
complexity: { time: "O(log(m * n))", space: "O(1)" }
---

You're given an `m x n` integer `matrix` with two properties:

- every row is sorted in ascending order;
- the first value of each row is greater than the last value of the row above it.

Return `true` if `target` appears in the matrix and `false` otherwise, in `O(log(m * n))` time.

## Constraints

- `1 <= m, n <= 100`
- `-10^4 <= matrix[i][j], target <= 10^4`
