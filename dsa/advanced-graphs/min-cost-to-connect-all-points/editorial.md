**Key insight:** "connect everything with exactly one path between any two points at minimum cost" is a minimum spanning tree. The graph is complete (`n²/2` edges), so Prim with an `O(n²)` array beats sorting all edges.

## Approach (Prim, dense version)

1. `minDist[i]` = cheapest edge from point `i` into the tree so far; start with `Infinity`, and `minDist[0] = 0`.
2. Repeat `n` times: pick the unvisited point `u` with the smallest `minDist`, add it to the tree and add `minDist[u]` to the total.
3. For every unvisited `v`, `minDist[v] = min(minDist[v], dist(u, v))`.

No heap needed: scanning an array of `n` is as cheap as the `n` relaxations you do anyway.

## Complexity

- Time `O(n²)` — `n` rounds, each scanning and relaxing `n` points.
- Space `O(n)`.

## Alternatives to mention

- **Kruskal:** generate all `n(n-1)/2` edges, sort, union-find. `O(n² log n)` time and `O(n²)` memory — fine for small `n`, heavier here.
- **Prim with a heap:** `O(n² log n)` on a complete graph because every edge may be pushed — worse than the array version for dense graphs.

## Pitfalls

- A single point costs `0`.
- Pick the next point by `minDist`, not by its distance to the most recently added point — that's a greedy nearest-neighbour walk, not an MST.
- Coordinates span `±10^6`, so distances reach `4 · 10^6`; totals stay well inside safe integers.
