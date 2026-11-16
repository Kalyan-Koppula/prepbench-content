---
title: Rotting Oranges
difficulty: Medium
order: 4
lists: [neetcode150, striver]
tags: [bfs, multi-source-bfs, matrix]
leetcode: rotting-oranges
function: orangesRotting
params:
  - { name: grid, type: "number[][]" }
returns: number
hints:
  - All rotten oranges spread at the same time. How do you run one search from many starting points at once?
  - Put every initially rotten orange in the queue, then process the queue one minute (one level) at a time.
  - Count fresh oranges up front; if any remain when the queue empties, the answer is `-1`.
complexity: { time: "O(m · n)", space: "O(m · n)" }
---

A crate is modelled as an `m x n` grid where each cell is:

- `0` — empty,
- `1` — a fresh orange,
- `2` — a rotten orange.

Every minute, each fresh orange that shares an edge with a rotten orange becomes rotten.

Return the number of minutes until no fresh orange is left. Return `0` if there are no fresh oranges at the start, and `-1` if some fresh orange can never rot.

## Constraints

- `1 <= m, n <= 100`
- `grid[r][c]` is `0`, `1` or `2`
