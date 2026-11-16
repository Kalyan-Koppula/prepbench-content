**Key insight:** reverse the search. Instead of BFS from each `1` looking for a `0`, run one multi-source BFS starting from **every** `0` at distance 0. The first time the wave reaches a cell is its shortest distance.

## Approach

1. Create `dist` filled with `-1` (unknown). Set every `0` cell to `0` and enqueue it.
2. BFS: pop `(r, c)`; for each neighbour with `dist === -1`, set `dist = dist[r][c] + 1` and enqueue.
3. Return `dist`.

Setting `dist` on push doubles as the visited check.

## Complexity

- Time `O(m · n)` — every cell is enqueued once.
- Space `O(m · n)` — the output and the queue.

## Alternatives to mention

- **Two-pass DP:** sweep top-left → bottom-right taking `min(up, left) + 1`, then bottom-right → top-left with `min(down, right) + 1`. Same `O(m · n)` time, `O(1)` extra space beyond the output. Works because shortest paths in an obstacle-free grid are monotone.
- Brute force: BFS from every `1` → `O((m · n)²)`.

## Pitfalls

- Seeding the queue with only one `0` gives distances to *that* zero, not the nearest one.
- Use a head index rather than `shift()` — the queue can hold all 10⁴ cells.
