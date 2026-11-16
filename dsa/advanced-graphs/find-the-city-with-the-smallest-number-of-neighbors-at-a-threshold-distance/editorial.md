**Key insight:** the question needs distances between all pairs of cities, and `n ≤ 100` — that's Floyd–Warshall territory. Build the distance matrix, then count per row.

## Approach

1. `dist[i][j] = Infinity`, `dist[i][i] = 0`, and `dist[u][v] = dist[v][u] = w` for each road.
2. For each intermediate city `k` (outer loop), for each `i`, `j`: `dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])`.
3. For each city `i`, count `j != i` with `dist[i][j] <= threshold`. Track the city with the smallest count, using `<=` while scanning upward so ties go to the larger label.

## Complexity

- Time `O(n³)` — about 10⁶ steps at `n = 100`.
- Space `O(n²)` — the matrix.

## Alternatives to mention

- **Dijkstra from every city:** `O(n · E log n)`; better on sparse graphs with large `n`.
- Bellman-Ford from every city: `O(n² · E)` — correct but slow.

## Pitfalls

- The `k` loop must be outermost. Putting it inside uses paths through `k` before they are final.
- Roads are two-way: set both `dist[u][v]` and `dist[v][u]`.
- Don't count the city itself (distance `0`).
