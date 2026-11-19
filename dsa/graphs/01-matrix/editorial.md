**Key idea:** instead of searching outward from every `1` to find a `0`, search outward from **all** the `0`s at once. A multi-source BFS reaches each cell first from its nearest zero, so the BFS level at which a cell is reached is its answer.

## Recognising the pattern

"Distance to the nearest of several sources" is the multi-source BFS template from the [Graphs](/problems/patterns/graphs) sheet. Reversing the direction (from the targets to every cell) replaces many searches with one.

## Brute force

There are no walls in this grid, so the shortest path between two cells is their Manhattan distance `|r1 − r2| + |c1 − c2|`. For every cell, compute the minimum Manhattan distance to every zero. That is the reference brute force below. Correct, but `O((m · n)²)` in the worst case. (A BFS from every `1` separately is no better.)

## Multi-source BFS

1. Create `dist` filled with −1 (unreached). Set every `0` cell's distance to 0 and add it to the queue.
2. While the queue isn't empty: dequeue a cell, and for each neighbour still at −1, set its distance to the cell's distance plus 1 and enqueue it.
3. Return `dist`.

BFS processes cells in increasing distance from the set of zeros, so the first time a cell is reached is via its nearest zero. Using −1 as "unreached" doubles as the visited check.

**Two-pass DP alternative.** Sweep top-left to bottom-right taking `min(up, left) + 1`, then bottom-right to top-left taking `min(down, right) + 1`. Also `O(m · n)`, with no queue.

## Walkthrough

```
0 0 0        0 0 0
0 1 0   →    0 1 0
1 1 1        1 2 1
```

| BFS level | cells assigned |
| --- | --- |
| 0 | all five zeros |
| 1 | (1,1), (2,0), (2,2) |
| 2 | (2,1) |

## Complexity

- Brute force: time `O((m · n)²)`, space `O(m · n)` for the output.
- Multi-source BFS: time `O(m · n)`, space `O(m · n)` for the queue and distances.
- Two-pass DP: time `O(m · n)`, space `O(1)` beyond the output.

## Edge cases

- All zeros: the output is all zeros.
- A single zero: distances grow like a diamond around it.
- One row or one column: still works.

## Common mistakes

- BFS from every `1` separately.
- Using a plain stack instead of a queue (that's DFS, which doesn't give shortest distances).
- Overwriting distances that were already set.

## In the interview

- Explain why starting from all zeros at once gives nearest distances.
- Mention the two-pass DP as the queue-free alternative.
- Likely follow-ups:
  - *Obstacles in the grid?* Manhattan distance no longer works; BFS still does (Walls and Gates).
  - *Distance to the nearest of several types?* Run one multi-source BFS per type, or carry the source type along.
