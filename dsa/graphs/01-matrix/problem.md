---
title: 01 Matrix
difficulty: Medium
order: 5
lists: [striver]
tags: [bfs, multi-source-bfs, matrix]
leetcode: 01-matrix
function: updateMatrix
params:
  - { name: mat, type: "number[][]" }
returns: "number[][]"
hints:
  - Searching outward from every `1` repeats a lot of work. Which cells already know their answer?
  - Start one BFS from all `0` cells at once; the first time the BFS reaches a cell gives its distance.
complexity: { time: "O(m · n)", space: "O(m · n)" }
---

You're given an `m x n` matrix `mat` containing only `0`s and `1`s.

Return a matrix of the same shape where each cell holds the distance from that cell to the nearest `0` in `mat`. A step moves to an edge-adjacent cell (up, down, left or right) and costs `1`.

## Constraints

- `1 <= m, n`, `m · n <= 10^4`
- `mat[r][c]` is `0` or `1`
- `mat` contains at least one `0`
