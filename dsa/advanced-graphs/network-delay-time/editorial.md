**Key insight:** each node hears the signal at its shortest-path distance from `k`. Run Dijkstra from `k`; the answer is the maximum distance, or `-1` if any node is unreachable.

## Approach

1. Build adjacency lists `u → [v, w]`.
2. `dist[k] = 0`, others `Infinity`. Push `[0, k]` into a min-heap.
3. Pop the closest `[d, u]`; skip it if `d > dist[u]` (a stale entry). Relax every edge `u → v`: if `d + w < dist[v]`, update and push.
4. Answer `max(dist[1..n])`; if that is `Infinity`, return `-1`.

## Complexity

- Time `O(E log V)` — each successful relaxation pushes one heap entry.
- Space `O(V + E)` — graph plus heap.

## Alternatives to mention

- **Bellman-Ford:** `n - 1` rounds relaxing every edge. `O(V · E)`; simpler and fine at these limits, and it handles negative weights.
- **Floyd–Warshall:** overkill (all pairs) at `O(V³)`.
- With `n ≤ 100`, an `O(V²)` array-based Dijkstra (scan for the closest unvisited node) is also acceptable and avoids a heap.

## Pitfalls

- Nodes are 1-indexed; size arrays `n + 1` and ignore index `0` when taking the max.
- Links are directed — don't add the reverse edge.
- `0`-weight edges are allowed; Dijkstra handles them as long as nothing is negative.
