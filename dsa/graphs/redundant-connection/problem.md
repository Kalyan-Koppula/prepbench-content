---
title: Redundant Connection
difficulty: Medium
order: 14
lists: [neetcode150]
tags: [union-find, cycle-detection]
leetcode: redundant-connection
function: findRedundantConnection
params:
  - { name: edges, type: "number[][]" }
returns: "number[]"
hints:
  - Adding edges one by one, the first edge whose endpoints are already connected must lie on the cycle.
  - Union-find answers "already connected?" in near-constant time. Why is that first cycle-closing edge also the last cycle edge in the input?
complexity: { time: "O(n · α(n))", space: "O(n)" }
---

A tree with `n` nodes labelled `1` to `n` had one extra edge added between two distinct nodes, so the graph now has exactly one cycle. The result is given as `edges`, a list of `n` undirected edges `[a, b]`.

Return an edge that can be removed so the remaining `n - 1` edges form a tree. If several edges qualify, return the one that appears **last** in `edges`, written exactly as it appears in the input.

## Constraints

- `3 <= n <= 1000`, `edges.length == n`
- `edges[i] = [a, b]` with `1 <= a < b <= n`
- No edge appears twice, and the graph is connected.
