**Key insight:** multi-source BFS. Enqueue every rotten orange at minute 0; each BFS level is one minute of spreading. The answer is the depth of the last level that rotted something.

## Approach

1. Scan the grid: push every `2` into the queue and count the `1`s as `fresh`.
2. While the queue is non-empty and `fresh > 0`, process exactly the current level (`queue.length` at the start of the minute). For each orange, rot its fresh neighbours, decrement `fresh`, and enqueue them. Increment `minutes` after the level.
3. Return `fresh === 0 ? minutes : -1`.

Stopping when `fresh` hits zero avoids counting an extra empty minute at the end.

## Complexity

- Time `O(m · n)` — each cell enters the queue at most once.
- Space `O(m · n)` — the queue.

## Alternatives to mention

- Simulate minute by minute, rescanning the whole grid each time: `O((m · n)²)` in the worst case (a long snake of oranges).
- Running one BFS per rotten orange and taking minima is also slower and unnecessary — the multi-source queue already gives each cell its distance to the *nearest* rotten orange.

## Pitfalls

- No fresh oranges → `0`, even when there are no rotten ones either.
- Fresh oranges but no rotten ones → `-1`.
- Rot the neighbour when enqueuing so it isn't enqueued twice in the same minute.
