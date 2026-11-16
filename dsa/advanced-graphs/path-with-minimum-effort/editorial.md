**Key insight:** this is a shortest-path problem where a route's cost is `max` of its steps instead of the sum. Because extending a route can never lower that max, Dijkstra still works — pop cells in order of their best-known effort.

## Approach

1. `effort[r][c] = Infinity`, except `effort[0][0] = 0`. Push `[0, 0, 0]` (effort, row, col) into a min-heap.
2. Pop the smallest; skip stale entries. If it's the target, return its effort — the first pop of the target is optimal.
3. For each neighbour, `cand = max(effort, |h[next] - h[cur]|)`. If `cand` improves the neighbour, record it and push.

## Complexity

- Time `O(m · n · log(m · n))` — up to 4 pushes per cell.
- Space `O(m · n)`.

## Alternatives to mention

- **Binary search + BFS:** search the effort `E` in `[0, 10^6]`; BFS using only steps `≤ E`. `O(m · n · log(maxH))`.
- **Kruskal / union-find:** sort all neighbouring-cell edges by height difference and union them in order; the answer is the weight of the edge that first connects start and finish.
- Plain BFS/DFS without a priority order doesn't work — the first path found isn't the one with the smallest maximum.

## Pitfalls

- A `1 x 1` grid needs no moves: effort `0`.
- Return on popping the target, not on pushing it; a later pop could be better at push time.
