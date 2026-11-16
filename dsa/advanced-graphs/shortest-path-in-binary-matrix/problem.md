---
title: Shortest Path in Binary Matrix
difficulty: Medium
order: 3
lists: [striver]
tags: [bfs, matrix]
leetcode: shortest-path-in-binary-matrix
function: shortestPathBinaryMatrix
params:
  - { name: grid, type: "number[][]" }
returns: number
hints:
  - Every move costs the same, so the first time BFS reaches a cell is along a shortest path.
  - A cell has up to 8 neighbours here. Check the start and end cells before searching.
complexity: { time: "O(n²)", space: "O(n²)" }
---

You're given an `n x n` grid of `0`s (open) and `1`s (blocked). A **clear path** goes from the top-left cell `(0, 0)` to the bottom-right cell `(n - 1, n - 1)`, visiting only open cells, where each move goes to one of the 8 surrounding cells (edges or corners touching).

The length of a path is the number of cells it visits, including both ends. Return the length of the shortest clear path, or `-1` if none exists.

## Constraints

- `1 <= n <= 100`
- `grid[r][c]` is `0` or `1`
