---
title: Graph Valid Tree
difficulty: Medium
order: 13
lists: [neetcode150]
tags: [union-find, dfs, bfs]
leetcode: graph-valid-tree
function: validTree
params:
  - { name: n, type: number }
  - { name: edges, type: "number[][]" }
returns: boolean
hints:
  - A tree on `n` nodes has a very specific number of edges. What does that check rule out on its own?
  - With exactly `n - 1` edges, the graph is a tree if and only if it is connected (equivalently, has no cycle).
complexity: { time: "O(V + E · α(V))", space: "O(V)" }
---

You're given `n` nodes labelled `0` to `n - 1` and a list of undirected `edges`, where `edges[i] = [a, b]` connects `a` and `b`.

Return `true` if these edges form a valid tree — every node is connected and there are no cycles — otherwise `false`.

## Constraints

- `1 <= n <= 2000`
- `0 <= edges.length <= 5000`
- `edges[i] = [a, b]` with `0 <= a, b < n` and `a != b`
- No edge appears twice.
