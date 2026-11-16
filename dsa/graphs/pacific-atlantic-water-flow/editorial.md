**Key insight:** reverse the flow. Start from each ocean's edge cells and walk **uphill** (to neighbours of height `>=` the current one). Every cell reached can drain into that ocean. Answer = intersection of the two reachable sets.

## Approach

1. `pac` and `atl` are boolean grids.
2. Seed a DFS/BFS for `pac` from the top row and left column; for `atl` from the bottom row and right column.
3. From a cell, move to an unvisited neighbour with `heights[next] >= heights[cur]`.
4. Collect every `[r, c]` with `pac[r][c] && atl[r][c]`.

## Complexity

- Time `O(m · n)` — each search visits every cell at most once.
- Space `O(m · n)` — the two visited grids plus the stack.

## Alternatives to mention

- Per-cell DFS downhill to see whether both oceans are reachable: `O((m · n)²)`. Fine to mention as the starting point, then optimise by reversing the direction.

## Pitfalls

- The comparison flips when you reverse: forward flow is `next <= cur`, the reversed search needs `next >= cur`.
- Equal heights let water move both ways — plateaus matter.
- Corner cells `(0, n-1)` and `(m-1, 0)` touch both oceans directly.
