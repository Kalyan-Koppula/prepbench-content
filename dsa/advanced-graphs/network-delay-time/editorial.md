**Key idea:** the time a node receives the signal is its shortest-path distance from `k`, with link times as edge weights. Run Dijkstra from `k`. Everyone has the signal when the farthest node gets it, so the answer is the largest distance, or −1 if some node is unreachable.

## Recognising the pattern

Non-negative edge weights and "earliest time" from a single source: Dijkstra, the first tool in the [Advanced Graphs](/problems/patterns/advanced-graphs) sheet. Plain BFS doesn't work because links take different amounts of time.

## Brute force

Bellman-Ford: relax every link `n − 1` times (a shortest path uses at most `n − 1` links), stopping early if a round changes nothing. That is the reference brute force below. Time `O(n · E)`. Correct, and it would also handle negative weights, but it is slower than needed here.

## Dijkstra

1. Build adjacency lists of `[v, w]` pairs.
2. `dist` = all ∞, `dist[k] = 0`. Push `[0, k]` into a min-heap.
3. While the heap isn't empty:
   1. Pop `[d, u]`. If `d > dist[u]`, it is a stale entry: skip it.
   2. For each `[v, w]`: if `d + w < dist[v]`, update `dist[v]` and push `[dist[v], v]`.
4. Answer: the maximum of `dist[1..n]`, or −1 if any is still ∞.

**Why the first pop is final.** All weights are non-negative, so any other route to `u` passes through a node whose distance is at least `d` and can only add more. Nothing found later can beat `d`.

## Walkthrough

`times = [[2, 1, 1], [2, 3, 1], [3, 4, 1]]`, `n = 4`, `k = 2`

| pop | relax | dist (1, 2, 3, 4) |
| --- | --- | --- |
| (0, 2) | 1 → 1, 3 → 1 | 1, 0, 1, ∞ |
| (1, 1) | – | 1, 0, 1, ∞ |
| (1, 3) | 4 → 2 | 1, 0, 1, 2 |
| (2, 4) | – | 1, 0, 1, 2 |

Largest distance `2`.

## Complexity

- Bellman-Ford: time `O(n · E)`, space `O(n)`.
- Dijkstra with a binary heap: time `O((n + E) log n)`, space `O(n + E)`.

## Edge cases

- A node with no incoming links (other than `k`): unreachable, return −1.
- `n = 1`: the answer is 0.
- Zero-time links: allowed, and Dijkstra handles them.

## Common mistakes

- Treating links as undirected.
- Not skipping stale heap entries, which repeats work.
- Returning the sum of distances instead of the maximum.

## In the interview

- Name Dijkstra and explain why the weights must be non-negative.
- Likely follow-ups:
  - *Negative link times?* Bellman-Ford (and it detects negative cycles).
  - *Many sources?* Push all of them at distance 0.
  - *Dense graph, small `n`?* Dijkstra with an array instead of a heap, `O(n²)`.
