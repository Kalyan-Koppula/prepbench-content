**Key insight:** a bridge is an edge on no cycle. Tarjan's algorithm detects that in one DFS: give each node a discovery time `disc`, and compute `low` = the smallest `disc` reachable from its DFS subtree using one back edge. Tree edge `u → v` is a bridge iff `low[v] > disc[u]`.

## Approach

1. Build adjacency lists. `disc[v] = -1` for all nodes; a global `timer`.
2. `dfs(u, parent)`: set `disc[u] = low[u] = timer++`. For each neighbour `v`:
   - `v === parent` → skip (the edge you came in on is not a back edge).
   - `v` unvisited → `dfs(v, u)`, then `low[u] = min(low[u], low[v])`; if `low[v] > disc[u]`, record `[u, v]`.
   - `v` visited → back edge: `low[u] = min(low[u], disc[v])`.
3. Start from node `0` (the graph is connected) and return the recorded edges.

Intuition: if nothing in `v`'s subtree can reach `u` or an ancestor without using `u — v`, cutting that edge strands the subtree.

## Complexity

- Time `O(V + E)` — a single DFS.
- Space `O(V + E)` — adjacency lists and recursion.

## Alternatives to mention

- Brute force: remove each edge and test connectivity with BFS — `O(E · (V + E))`.

## Pitfalls

- Skipping by parent **node** is fine here because there are no parallel edges; with multi-edges, skip by edge id instead.
- Using `low[v]` (rather than `disc[v]`) for back edges happens to work for bridges, but `disc[v]` is the standard definition — and it's required for articulation points.
- Recursion depth reaches `V` on a long path; mention an iterative DFS for very large graphs.
