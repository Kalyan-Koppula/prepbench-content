---
title: Min Cost to Connect All Points
difficulty: Medium
order: 5
lists: [neetcode150]
tags: [minimum-spanning-tree, prim, kruskal, union-find]
leetcode: min-cost-to-connect-all-points
function: minCostConnectPoints
params:
  - { name: points, type: "number[][]" }
returns: number
hints:
  - Every pair of points can be joined, so this is a complete graph. You want the cheapest set of edges that connects everything.
  - That's a minimum spanning tree. With `n²` edges, Prim's algorithm with a plain distance array runs in `O(n²)` without sorting any edges.
complexity: { time: "O(n²)", space: "O(n)" }
---

You're given `points`, where `points[i] = [x, y]` is a point on a 2D plane.

Connecting points `[x1, y1]` and `[x2, y2]` costs their Manhattan distance, `|x1 - x2| + |y1 - y2|`. Return the minimum total cost to connect all the points so that there is exactly one simple path between any two of them.

## Constraints

- `1 <= points.length <= 1000`
- `-10^6 <= x, y <= 10^6`
- All points are distinct.
