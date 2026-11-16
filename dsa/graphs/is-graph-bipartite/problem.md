---
title: Is Graph Bipartite?
difficulty: Medium
order: 11
lists: [striver]
tags: [bfs, dfs, graph-coloring]
leetcode: is-graph-bipartite
function: isBipartite
params:
  - { name: graph, type: "number[][]" }
returns: boolean
hints:
  - Try to colour the nodes with two colours so that every edge joins different colours. When are you forced into a contradiction?
  - BFS or DFS from each uncoloured node, giving each neighbour the opposite colour. A neighbour that already has the *same* colour means the answer is `false`.
complexity: { time: "O(V + E)", space: "O(V)" }
---

An undirected graph has `n` nodes labelled `0` to `n - 1`. `graph[u]` lists every node adjacent to `u`. The graph may be disconnected.

The graph is **bipartite** if its nodes can be split into two sets so that every edge connects a node in one set to a node in the other.

Return `true` if the graph is bipartite, otherwise `false`.

## Constraints

- `1 <= n <= 1000`
- `0 <= graph[u].length < n`
- No self-loops and no repeated neighbours; adjacency is symmetric (`v` is in `graph[u]` exactly when `u` is in `graph[v]`).
