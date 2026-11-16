**Key insight:** a route becomes swimmable at the time equal to its highest cell, so the answer is the minimum, over all routes, of the route's maximum elevation. That's a minimax path — Dijkstra with `max` as the combine step.

## Approach

1. Min-heap of `[time, r, c]`, seeded with `[grid[0][0], 0, 0]`; a `seen` grid.
2. Pop the lowest-time cell. If it's the target, return its time.
3. For each unseen neighbour, push `[max(time, grid[nr][nc]), nr, nc]` and mark it seen.

Marking on push is safe here: the first time a cell is pushed it gets `max(currentLevel, its own height)`, and the current level never decreases as the heap is drained, so no later push could be smaller.

## Complexity

- Time `O(n² log n)` — `n²` cells, each pushed once.
- Space `O(n²)`.

## Alternatives to mention

- **Binary search on `t` + BFS/DFS** restricted to cells `≤ t`: `O(n² log n)`.
- **Union-find in elevation order:** add cells from lowest to highest, union with already-added neighbours, and stop when start and end connect — the current elevation is the answer. Same bound plus sorting.
- Same structure as *Path With Minimum Effort*, with node weights instead of edge weights.

## Pitfalls

- The start cell's own elevation counts — you can't leave before `t = grid[0][0]`.
- `n = 1`: answer is `grid[0][0]`.
