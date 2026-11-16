---
title: Pacific Atlantic Water Flow
difficulty: Medium
order: 8
lists: [neetcode150]
tags: [dfs, bfs, matrix]
leetcode: pacific-atlantic-water-flow
function: pacificAtlantic
params:
  - { name: heights, type: "number[][]" }
returns: "number[][]"
compare: unordered
hints:
  - Checking every cell's downhill paths separately is expensive. Which cells definitely reach each ocean?
  - Search uphill from the ocean edges instead — from a cell you may move to a neighbour that is at least as high.
  - Run that search once per ocean and return the cells reached by both.
complexity: { time: "O(m · n)", space: "O(m · n)" }
---

An island is an `m x n` grid of heights. The **Pacific** ocean touches the island's top and left edges; the **Atlantic** touches its bottom and right edges.

Rain on a cell flows to an edge-adjacent neighbour whose height is **less than or equal to** the current cell's height, and so on. Water on any cell in the outer row or column next to an ocean flows straight into that ocean.

Return the coordinates `[r, c]` of every cell from which water can reach **both** oceans. The order of the coordinates in the result does not matter.

## Constraints

- `1 <= m, n <= 200`
- `0 <= heights[r][c] <= 10^5`
