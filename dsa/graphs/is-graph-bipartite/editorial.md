**Key insight:** a graph is bipartite exactly when it can be 2-coloured, which fails precisely when it contains an odd cycle. Greedy BFS colouring finds that contradiction if it exists.

## Approach

1. `color[u] = -1` for every node (uncoloured).
2. For each uncoloured node `s` (the graph may be disconnected), colour it `0` and BFS.
3. For each edge `u — v`: if `v` is uncoloured, give it `1 - color[u]` and enqueue; if `color[v] === color[u]`, return `false`.
4. If every component finishes cleanly, return `true`.

The colouring is forced: once `s` is fixed, every node in its component has exactly one legal colour, so a conflict really means "impossible", not "bad choice".

## Complexity

- Time `O(V + E)` — each node and edge is processed once.
- Space `O(V)` — colours plus the queue.

## Alternatives to mention

- DFS colouring — identical logic, recursion depth up to `V`.
- Union-find: for each `u`, union all of its neighbours together; a conflict is `find(u) === find(v)` for some neighbour `v`.

## Pitfalls

- Starting only from node `0` misses odd cycles in other components.
- An isolated node (empty adjacency list) is trivially fine.
