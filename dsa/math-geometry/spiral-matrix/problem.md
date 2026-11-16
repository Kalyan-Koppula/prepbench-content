---
title: Spiral Matrix
difficulty: Medium
order: 4
lists: [neetcode150, striver]
tags: [matrix, simulation]
leetcode: spiral-matrix
function: spiralOrder
params:
  - { name: matrix, type: "number[][]" }
returns: "number[]"
hints:
  - Peel the matrix one ring at a time.
  - "Keep four boundaries `top`, `bottom`, `left`, `right`. Walk right, down, left, up, shrinking a boundary after each edge — and re-check them before the last two edges."
complexity: { time: "O(m · n)", space: "O(1) extra" }
---

Given an `m x n` matrix, return all of its elements in **clockwise spiral order**: across the top row left to right, down the right column, back along the bottom row right to left, up the left column, then the same again on the inner rectangle, until every element has been listed once.

## Constraints

- `1 <= m, n <= 100`
- `-100 <= matrix[i][j] <= 100`
