**Key idea:** a route's cost is its **largest** single step, not the sum. Dijkstra still works if you combine costs with `max` instead of `+`: the cost to reach a neighbour through `u` is `max(effort to u, step from u)`. The first time the target is popped from the heap, its effort is optimal.

## Recognising the pattern

"Minimise the maximum along a path" is a **bottleneck** shortest path, covered in the [Advanced Graphs](/problems/patterns/advanced-graphs) sheet. Two standard approaches: Dijkstra with `max`, or binary search on the answer with a reachability check.

## Alternative: binary search on the effort (shown below)

Guess an effort limit and ask: can you reach the target using only steps no larger than the limit? That is a BFS. If a limit works, every larger limit works too, so binary search the smallest working limit over `0 .. 10^6`. That is the reference brute force below. Time `O(m · n · log(max height))`.

## Dijkstra with a max cost

1. `best` = all ∞, `best[0][0] = 0`; push `[0, 0, 0]` (effort, row, column).
2. While the heap isn't empty:
   1. Pop the smallest effort. Skip stale entries.
   2. If it is the target, return the effort.
   3. For each neighbour: `candidate = max(effort, |height difference|)`. If smaller than its `best`, update and push.

**Why `max` still allows Dijkstra.** Extending a path can never make its cost smaller (`max` never decreases), which is the same property non-negative weights give a sum. So the first time a cell is popped, no cheaper route to it can appear later.

## Walkthrough

```
1 2 2
3 8 2
5 3 5
```

The route `1 → 3 → 5 → 3 → 5` (down the left column, then along the bottom) has steps 2, 2, 2, 2, so effort 2. Any route through the `8` has a step of at least 5, and the route along the top row reaches the last column with steps 1, 0, 0, then a step of 3 down to the corner. Dijkstra pops cells in order of effort 0, 1, 2 … and reaches the corner with effort `2`.

## Complexity

- Binary search plus BFS: time `O(m · n · log H)` for heights up to `H`. Space `O(m · n)`.
- Dijkstra: time `O(m · n · log(m · n))`, space `O(m · n)`.

## Edge cases

- A single cell: effort 0.
- All heights equal: effort 0.
- One row or one column: the effort is the largest adjacent difference.

## Common mistakes

- Summing the step differences.
- Plain BFS by number of steps, which ignores the heights.
- Returning when the target is first **pushed** rather than first **popped**.

## In the interview

- Explain why `max` keeps Dijkstra valid, or offer the binary search version, which many find easier to justify.
- Likely follow-ups:
  - *Swim in Rising Water?* The same bottleneck, with the cost being the largest height on the path.
  - *Union-find approach?* Sort all edges by difference and add them until start and end connect; the last edge added is the answer.
