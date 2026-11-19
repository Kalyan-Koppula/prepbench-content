**Key idea:** you can reach the corner at time `t` exactly when some path from start to finish never goes above elevation `t`. So the answer is the smallest possible **maximum** elevation along a path, a bottleneck shortest path. Dijkstra with `max` instead of `+` finds it: always extend the frontier through the lowest available cell.

## Recognising the pattern

"Minimise the highest point on a path" is the bottleneck variant in the [Advanced Graphs](/problems/patterns/advanced-graphs) sheet, the same structure as Path With Minimum Effort with cell heights instead of step differences.

## Alternative: binary search on the time (shown below)

If you can reach the corner at time `t`, you can at any later time, so binary search the smallest `t` in `[0, n² − 1]`, checking each with a BFS that only enters cells with elevation `≤ t`. That is the reference brute force below. Time `O(n² log n)`.

## Dijkstra with a max cost

1. Push `[grid[0][0], 0, 0]` into a min-heap and mark the start seen.
2. Repeatedly pop the entry with the smallest time. If it is the corner, return its time.
3. For each unseen neighbour, mark it and push `[max(time, grid[nr][nc]), nr, nc]`.

Because elevations only push the time up (never down), the first time the corner comes off the heap, no route can reach it sooner. Marking cells when they are pushed is safe here: the frontier always grows through the lowest cell first, so the first time a cell is reached is with its best time.

## Walkthrough

```
0  2
1  3
```

| pop | time | push |
| --- | --- | --- |
| (0, 0) | 0 | (0,1) at 2, (1,0) at 1 |
| (1, 0) | 1 | (1,1) at 3 |
| (0, 1) | 2 | – |
| (1, 1) | 3 | corner reached |

Answer `3`: the corner itself has elevation 3, so no earlier time works.

## Complexity

- Binary search plus BFS: time `O(n² log n)`, space `O(n²)`.
- Dijkstra: time `O(n² log n)`, space `O(n²)`.

## Edge cases

- `n = 1`: the answer is `grid[0][0]`.
- The start or the corner being the highest cell: the answer is at least that elevation.

## Common mistakes

- Summing elevations along the path.
- Forgetting that the start cell's own elevation counts.
- Plain BFS by number of moves.

## In the interview

- Explain the reformulation: "earliest time = smallest possible maximum on a path."
- Mention the union-find alternative: add cells in order of elevation and stop when start and corner are connected; the last elevation added is the answer.
- Likely follow-ups:
  - *Minimum effort (largest step difference)?* The same Dijkstra with a different cost (Path With Minimum Effort).
