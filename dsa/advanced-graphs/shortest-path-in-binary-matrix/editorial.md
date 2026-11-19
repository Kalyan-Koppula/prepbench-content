**Key idea:** every move costs the same, so the shortest path is found by **BFS**. Moves go to any of the 8 surrounding open cells. BFS explores cells level by level; the level at which the bottom-right corner is first reached is the answer.

## Recognising the pattern

Unweighted shortest path on a grid is the BFS template from the [Graphs](/problems/patterns/graphs) sheet. It sits in the [Advanced Graphs](/problems/patterns/advanced-graphs) ladder as the contrast case: no heap is needed when all edges cost 1.

## Brute force

Relax every open cell from its 8 neighbours repeatedly until no distance improves (Bellman-Ford on the grid). That is the reference brute force below. Correct, but each pass is `O(n²)` and many passes may be needed: up to `O(n⁴)`.

## BFS by levels

1. If the start or the end is blocked, return −1.
2. Mark the start visited; `level = [start]`, `length = 1`.
3. While the level isn't empty:
   1. If the corner is in this level, return `length`.
   2. Build the next level from every open, unvisited 8-neighbour, marking each when it is added.
   3. `length++`.
4. Return −1.

Marking cells by setting them to 1 reuses the grid as the visited array; use a separate grid if the input must stay unchanged.

## Walkthrough

```
0 0 0
1 1 0
1 1 0
```

| length | cells in level |
| --- | --- |
| 1 | (0,0) |
| 2 | (0,1) |
| 3 | (0,2), (1,2) |
| 4 | (2,2) → reached |

Answer `4`. The diagonal move from (0,1) to (1,2) gets there as fast as going right then down.

## Complexity

- Repeated relaxation: up to `O(n⁴)`.
- BFS: time `O(n²)`, each cell visited once with 8 checks. Space `O(n²)`.

## Edge cases

- `n = 1` and the cell is open: answer 1.
- Start or end blocked: −1.
- No path around the walls: −1.

## Common mistakes

- Only 4 directions instead of 8.
- Counting moves instead of cells (off by one).
- Forgetting to check whether the destination itself is blocked.

## In the interview

- Note that BFS is optimal because all moves cost the same; with weights you'd switch to Dijkstra.
- Likely follow-ups:
  - *Return the path?* Store each cell's parent and walk back from the end.
  - *Faster in practice?* A* search with a distance heuristic, or bidirectional BFS.
