**Key insight:** multi-source BFS from all gates at once. BFS reaches each room first along a shortest path from whichever gate is nearest, so one pass fills every room.

## Approach

1. Push every gate `(r, c)` into the queue.
2. Pop a cell; for each neighbour that is still `INF`, set it to `rooms[r][c] + 1` and enqueue it.
3. Walls (`-1`) and already-filled rooms are never `INF`, so the same check skips them.

The `INF` value is the visited marker: a room is written exactly once, with its final answer.

## Complexity

- Time `O(m · n)` — every room is enqueued at most once.
- Space `O(m · n)` — the queue.

## Alternatives to mention

- BFS from each gate separately, keeping the minimum: `O(g · m · n)` for `g` gates.
- DFS from each gate with "only overwrite if smaller" pruning works but can revisit cells many times.

## Pitfalls

- Don't BFS from each empty room — that's `O((m · n)²)`.
- Leave unreachable rooms as `INF`; don't turn them into `-1` or `0`.
