**Key idea:** a connection is critical exactly when it lies on **no** cycle. One DFS finds all of them: record each server's discovery time, and for each server the earliest discovery time its subtree can reach using one non-tree edge (its **low-link**). A tree edge `u → v` is critical when `v`'s subtree can't reach `u` or anything above it: `low[v] > disc[u]`.

## Recognising the pattern

Edges whose removal disconnects a graph are **bridges**, found with Tarjan's algorithm in the [Advanced Graphs](/problems/patterns/advanced-graphs) sheet. It is a single DFS with two numbers per node.

## Brute force

Remove each connection in turn and check, with a DFS, whether every server is still reachable. That is the reference brute force below. Correct, but `O(E · (V + E))`: with 5,000 connections, about 35 million steps.

## Tarjan's bridge algorithm

1. Build adjacency lists. `disc` = all −1, a global `timer`.
2. `visit(u, parent)`:
   1. `disc[u] = low[u] = timer++`.
   2. For each neighbour `v`, skipping the edge back to `parent`:
      - If `v` is unvisited: `visit(v, u)`, then `low[u] = min(low[u], low[v])`. If `low[v] > disc[u]`, record `[u, v]` as a bridge.
      - Otherwise `v` is an ancestor reached by a back edge: `low[u] = min(low[u], disc[v])`.
3. `visit(0, −1)` and return the bridges.

**Why `low[v] > disc[u]`.** If some node in `v`'s subtree had an edge to `u` or one of its ancestors, that edge plus the tree path would form a cycle containing `u → v`, and `low[v]` would be `≤ disc[u]`. When it is strictly greater, the only way from `v`'s subtree to the rest of the network is the edge `u → v` itself.

## Walkthrough

`n = 4`, `connections = [[0,1], [1,2], [2,0], [1,3]]`

| visit | disc | low after children | bridge check |
| --- | --- | --- | --- |
| 0 | 0 | 0 | |
| 1 | 1 | 0 (via 2 → 0) | |
| 2 | 2 | 0 (back edge to 0) | low[2] = 0 > disc[1] = 1? no |
| 3 | 3 | 3 | low[3] = 3 > disc[1] = 1? **yes** → [1, 3] |

Answer `[[1, 3]]`: the triangle 0-1-2 is a cycle, and 3 hangs off it by one edge.

## Complexity

- Remove-and-check: time `O(E · (V + E))`, space `O(V + E)`.
- Tarjan: time `O(V + E)`, one DFS. Space `O(V + E)`, including recursion up to `V` deep.

## Edge cases

- A tree: every edge is a bridge.
- A single cycle: no bridges.
- Parallel edges between the same two servers (not in this problem): skipping by parent **node** would wrongly ignore the second edge; skip by edge index instead.

## Common mistakes

- Using `>=` in the bridge test (that's the test for articulation points, not bridges).
- Updating `low[u]` with `low[v]` for back edges instead of `disc[v]`.
- Deep recursion on long chains; an iterative DFS avoids stack overflow.

## In the interview

- State the "edge on no cycle" characterisation, then explain disc and low.
- Likely follow-ups:
  - *Critical servers (articulation points)?* The same DFS: a non-root `u` is critical if some child has `low[v] >= disc[u]`; the root if it has two or more DFS children.
  - *Make the network bridge-free with fewest new edges?* Contract the 2-edge-connected parts into a tree and connect its leaves.
