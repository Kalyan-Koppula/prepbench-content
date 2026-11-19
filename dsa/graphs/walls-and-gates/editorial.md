**Key idea:** run one breadth-first search that starts from **every gate at once**. BFS reaches each room first from its nearest gate, so the distance stored at that moment is final. Walls are never entered, and rooms that are never reached keep `INF`.

## Recognising the pattern

"Distance from each cell to the nearest of several sources, through a grid with obstacles" is multi-source BFS from the [Graphs](/problems/patterns/graphs) sheet. It is 01 Matrix with walls, which is why Manhattan distance no longer works.

## Brute force

Run a separate BFS from each gate and keep, for every room, the smallest distance found by any of them. That is the reference brute force below. Correct, but with `g` gates it costs `O(g · m · n)`, and the number of gates can be large.

## Multi-source BFS

1. Add every gate (value 0) to the queue.
2. While the queue isn't empty: dequeue a cell and, for each neighbour that is still `INF` (an unvisited empty room), set it to the cell's distance plus 1 and enqueue it.

Gates (0), walls (−1) and rooms already assigned all fail the `== INF` test, so the single comparison covers bounds of the search, obstacles and the visited check.

## Walkthrough

```
INF  -1   0  INF        3  -1   0   1
INF INF INF  -1    →    2   2   1  -1
INF  -1 INF  -1         1  -1   2  -1
  0  -1 INF INF         0  -1   3   4
```

| BFS level | rooms assigned |
| --- | --- |
| 0 | the gates at (0, 2) and (3, 0) |
| 1 | (0, 3), (1, 2), (2, 0) |
| 2 | (1, 1), (2, 2), (1, 0) |
| 3 | (0, 0), (3, 2) |
| 4 | (3, 3) |

## Complexity

- One BFS per gate: time `O(g · m · n)`, space `O(m · n)`.
- Multi-source BFS: time `O(m · n)`, space `O(m · n)` for the queue.

## Edge cases

- No gates: every room keeps `INF`.
- A room fully enclosed by walls: never reached, keeps `INF`.
- Gates next to each other: their neighbours get distance 1 from whichever is dequeued first, which is correct either way.

## Common mistakes

- BFS from each empty room toward gates, which is `O((m · n)²)`.
- Overwriting a room that already has a distance.
- Using DFS, which doesn't produce shortest distances without extra work.

## In the interview

- Mention 01 Matrix and Rotting Oranges as the same pattern.
- Likely follow-ups:
  - *Which gate is nearest?* Carry the gate's id along with the distance.
  - *Different costs per cell?* Dijkstra with a priority queue.
