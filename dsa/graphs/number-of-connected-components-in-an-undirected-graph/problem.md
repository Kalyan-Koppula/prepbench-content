---
title: Number of Connected Components in an Undirected Graph
difficulty: Medium
order: 12
lists: [neetcode150]
tags: [union-find, dfs, bfs]
leetcode: number-of-connected-components-in-an-undirected-graph
function: countComponents
params:
  - { name: n, type: number }
  - { name: edges, type: "number[][]" }
returns: number
hints:
  - Start by treating every node as its own component. What happens to the count when an edge joins two different components?
  - Union-find makes "are these already connected?" nearly O(1). Alternatively, count how many DFS runs it takes to visit every node.
complexity: { time: "O(V + E · α(V))", space: "O(V)" }
---

You're given `n` nodes labelled `0` to `n - 1` and a list of undirected `edges`, where `edges[i] = [a, b]` connects `a` and `b`.

Return the number of connected components in the graph.

## Constraints

- `1 <= n <= 2000`
- `0 <= edges.length <= 5000`
- `edges[i] = [a, b]` with `0 <= a, b < n` and `a != b`
- No edge appears twice.
