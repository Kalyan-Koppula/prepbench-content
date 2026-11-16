**Key insight:** this is "find the connected component containing `(sr, sc)`" on a grid graph, then repaint it. Painting a cell doubles as marking it visited.

## Approach

1. Read `start = image[sr][sc]`. If `start === color`, return immediately — nothing changes, and without this check the fill never knows which cells it has already visited.
2. DFS (or BFS) from `(sr, sc)`: paint the cell, then visit each in-bounds neighbour whose colour is still `start`.
3. Return the mutated image.

## Complexity

- Time `O(m · n)` — each pixel is painted at most once.
- Space `O(m · n)` — the explicit stack in the worst case (a fully same-coloured image).

## Pitfalls

- The `start === color` early return is the classic bug: without it, a recursive fill bounces between neighbours forever.
- Only edge-adjacent pixels connect; diagonals do not.
- Recursive DFS is fine at 50×50; mention an explicit stack for larger grids.
