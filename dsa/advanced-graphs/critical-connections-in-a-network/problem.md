---
title: Critical Connections in a Network
difficulty: Hard
order: 11
lists: [striver]
tags: [tarjan, bridges, dfs]
leetcode: critical-connections-in-a-network
function: criticalConnections
params:
  - { name: n, type: number }
  - { name: connections, type: "number[][]" }
returns: "number[][]"
compare: unordered-nested
hints:
  - An edge is critical exactly when it lies on no cycle. Removing every edge in turn and re-checking connectivity works, but is quadratic.
  - In one DFS, record each node's discovery time and the earliest discovery time reachable from its subtree using at most one back edge (its "low" value).
  - Tree edge `u → v` is a bridge when `low[v] > disc[u]` — nothing under `v` can climb back to `u` or above.
complexity: { time: "O(V + E)", space: "O(V + E)" }
---

A network has `n` servers labelled `0` to `n - 1`, joined by undirected `connections`, where `connections[i] = [a, b]` links `a` and `b`. The network is connected.

A connection is **critical** if removing it leaves some pair of servers unable to reach each other.

Return all critical connections. The order of the connections, and of the two servers inside each one, does not matter.

## Constraints

- `2 <= n <= 2000`
- `n - 1 <= connections.length <= 5000`
- `connections[i] = [a, b]` with `0 <= a, b < n` and `a != b`
- No connection appears twice, and every server is reachable from every other.
