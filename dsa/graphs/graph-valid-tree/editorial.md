**Key idea:** a graph on `n` nodes is a tree exactly when it has `n − 1` edges and no cycle (equivalently, `n − 1` edges and connected). Check the edge count first, then add edges with union-find: if an edge joins two nodes that are already connected, it creates a cycle.

## Recognising the pattern

"Is it a tree?" combines two graph facts from the [Graphs](/problems/patterns/graphs) sheet: trees have exactly `n − 1` edges, and union-find detects cycles in undirected graphs as edges arrive.

## Alternative: DFS from one node (shown below)

DFS from node 0, remembering the node each one was reached from. Meeting an already-visited node other than the one you came from means a cycle. At the end, every node must have been visited. That is the reference brute force below. Same `O(V + E)`.

## Union-find with an edge count

1. If the number of edges isn't `n − 1`, return `false`.
2. For each edge, find both roots. If they are equal, the edge closes a cycle: return `false`. Otherwise union them.
3. Return `true`.

**Why no connectivity check is needed.** Starting from `n` separate nodes, each edge that doesn't close a cycle merges two components. After `n − 1` such edges there is exactly one component left.

## Walkthrough

`n = 5`, `edges = [[0, 1], [0, 2], [0, 3], [1, 4]]`: 4 edges, which is `n − 1`.

| edge | roots before | result |
| --- | --- | --- |
| [0, 1] | 0, 1 | merge |
| [0, 2] | 1, 2 | merge |
| [0, 3] | 2, 3 | merge |
| [1, 4] | 3, 4 | merge |

No cycle, so `true`. With `[[0,1],[1,2],[2,3],[1,3],[1,4]]` there are 5 edges, already too many: `false`.

## Complexity

- Union-find: time `O(V + E · α(V))`, space `O(V)`.
- DFS: time `O(V + E)`, space `O(V + E)`.

## Edge cases

- `n = 1` with no edges: a tree.
- `n − 1` edges but disconnected: impossible without a cycle somewhere, which union-find catches.
- Duplicate edges: they form a cycle of length 2.

## Common mistakes

- Checking only for cycles, so a forest of separate trees passes.
- Checking only connectivity, so extra edges pass.
- In DFS, treating the edge back to the parent as a cycle.

## In the interview

- State the two conditions first; the edge-count shortcut impresses.
- Likely follow-ups:
  - *Which edge to remove to make a tree?* The edge that closes the cycle (Redundant Connection).
  - *Directed version (a rooted tree)?* Every node but the root has in-degree 1, and there is no cycle.
