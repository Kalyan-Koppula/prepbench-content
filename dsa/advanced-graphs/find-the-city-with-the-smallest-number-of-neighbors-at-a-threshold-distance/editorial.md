**Key idea:** you need shortest distances between **every** pair of cities, and there are at most 100 cities, so Floyd-Warshall is the natural fit. Then, for each city, count the others within the threshold, and pick the smallest count, preferring the larger label on ties.

## Recognising the pattern

All-pairs shortest paths on a small graph is the Floyd-Warshall entry of the [Advanced Graphs](/problems/patterns/advanced-graphs) sheet. Running Dijkstra from every city is the alternative and is faster on large, sparse graphs.

## Alternative: single-source from every city (shown below)

Run Bellman-Ford from each city over the two-way roads, then count. That is the reference brute force below: `O(n² · E)`. Dijkstra from each city would be `O(n · E log n)`.

## Floyd-Warshall

1. `dist[i][i] = 0`, `dist[u][v] = dist[v][u] = w` for each road, ∞ otherwise.
2. For each `k` from 0 to `n − 1`, for every pair `(i, j)`: `dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])`.
3. For each city, count `j ≠ i` with `dist[i][j] <= threshold`.
4. Keep the city with the smallest count, using `<=` so that later (larger) labels win ties.

**Why `k` is the outer loop.** After processing `k`, `dist[i][j]` is the shortest path whose intermediate cities are all among `0..k`. Each step allows one more city as a stopover, building on paths that already use only earlier ones.

## Walkthrough

`n = 4`, roads `0-1 (3)`, `1-2 (1)`, `1-3 (4)`, `2-3 (1)`, threshold 4.

Shortest distances after Floyd-Warshall:

| from | to 0 | to 1 | to 2 | to 3 | within 4 |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | 3 | 4 | 5 | 2 |
| 1 | 3 | 0 | 1 | 2 | 3 |
| 2 | 4 | 1 | 0 | 1 | 3 |
| 3 | 5 | 2 | 1 | 0 | 2 |

Cities 0 and 3 both reach 2 others; the larger label wins: answer `3`.

## Complexity

- Bellman-Ford from each city: time `O(n² · E)`, space `O(n)` per run.
- Floyd-Warshall: time `O(n³)`, about a million steps for 100 cities. Space `O(n²)`.

## Edge cases

- No roads: every city reaches 0 others; the answer is `n − 1`.
- Threshold smaller than every road: same as no roads.
- Roads longer than the threshold can still be useless even if they connect cities.

## Common mistakes

- Putting `k` in an inner loop.
- Treating roads as one-way.
- Breaking ties toward the smaller label.

## In the interview

- Justify Floyd-Warshall by the small `n`, and mention Dijkstra-from-every-node for larger sparse graphs.
- Likely follow-ups:
  - *Return the counts too?* They are computed in step 3.
  - *Negative roads?* Floyd-Warshall handles negative weights without negative cycles.
