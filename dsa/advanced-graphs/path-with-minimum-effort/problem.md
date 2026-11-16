---
title: Path With Minimum Effort
difficulty: Medium
order: 2
lists: [striver]
tags: [dijkstra, heap, matrix, binary-search]
leetcode: path-with-minimum-effort
function: minimumEffortPath
params:
  - { name: heights, type: "number[][]" }
returns: number
hints:
  - A path's cost is its single worst step, not the sum of steps. Can a shortest-path algorithm still work with that cost?
  - Dijkstra works when extending a path never makes it cheaper — `max(cost, step)` satisfies that.
  - Alternatively, binary search the answer and check reachability with BFS using only steps within the limit.
complexity: { time: "O(m · n · log(m · n))", space: "O(m · n)" }
---

You're given an `m x n` grid `heights`. You start at the top-left cell `(0, 0)` and want to reach the bottom-right cell `(m - 1, n - 1)`, moving up, down, left or right.

The **effort** of a route is the largest absolute height difference between two consecutive cells along it.

Return the minimum effort needed to get from the start to the finish.

## Constraints

- `1 <= m, n <= 100`
- `1 <= heights[r][c] <= 10^6`
