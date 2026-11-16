**Key insight:** unit-cost moves → BFS. The only twists are 8-directional neighbours and counting cells, not moves.

## Approach

1. If `grid[0][0]` or `grid[n-1][n-1]` is blocked, return `-1`.
2. BFS from `(0, 0)` with distance `1`. Mark cells visited when enqueuing (overwriting the grid cell with `1` works).
3. For each popped cell, try all 8 offsets `dr, dc ∈ {-1, 0, 1}` except `(0, 0)`.
4. Return the distance when the target is popped (or pushed); `-1` if the queue empties.

## Complexity

- Time `O(n²)` — each cell enqueued once, 8 neighbours each.
- Space `O(n²)` — the queue.

## Alternatives to mention

- **A\*** with Chebyshev distance `max(|dr|, |dc|)` to the corner as the heuristic explores far fewer cells on open grids. Worth mentioning; same worst case.
- DFS finds *a* path, not the shortest.

## Pitfalls

- `n = 1` with an open cell: answer `1`.
- Blocked start or end → `-1` before searching.
- Counting moves instead of cells is off by one.
