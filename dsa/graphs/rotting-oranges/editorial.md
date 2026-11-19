**Key idea:** rot spreads one step per minute from **every** rotten orange at once, which is a breadth-first search that starts from all rotten oranges together. Each BFS wave is one minute. When the waves stop, either every fresh orange has rotted (answer: the number of waves) or some are unreachable (answer: −1).

## Recognising the pattern

"Spreads to neighbours every time step" plus "minimum time" is **multi-source BFS** from the [Graphs](/problems/patterns/graphs) sheet. BFS visits cells in order of distance, and putting all the sources in the first wave makes the distance "time since the nearest rotten orange".

## Brute force

Simulate minute by minute: scan the whole grid, find every fresh orange next to a rotten one, and rot them all at once. Stop when nothing is fresh, or when a minute passes with no change (return −1). That is the reference brute force below. Each minute costs `O(m · n)` and there can be up to `O(m · n)` minutes: `O((m · n)²)`.

## Multi-source BFS

1. Put every rotten orange in the first wave and count the fresh ones.
2. While the wave is non-empty and fresh oranges remain:
   1. Build the next wave: for each orange in the current wave, rot every fresh neighbour, decrement `fresh`, and add it to the next wave.
   2. `minutes++`.
3. Return `minutes` if `fresh == 0`, otherwise −1.

Each orange enters a wave once, so the work is linear. Stopping when `fresh` reaches 0 avoids counting an extra, empty minute.

## Walkthrough

```
2 1 1
1 1 0
0 1 1
```

| minute | newly rotten | fresh left |
| --- | --- | --- |
| 0 | start: (0,0) | 6 |
| 1 | (0,1), (1,0) | 4 |
| 2 | (0,2), (1,1) | 2 |
| 3 | (2,1) | 1 |
| 4 | (2,2) | 0 |

Answer `4`.

## Complexity

- Minute-by-minute scans: time `O((m · n)²)`, space `O(m · n)`.
- Multi-source BFS: time `O(m · n)`, space `O(m · n)` for the waves.

## Edge cases

- No fresh oranges at the start: 0, even if there are no rotten ones.
- Fresh oranges but no rotten ones: −1.
- A fresh orange walled off by empty cells: −1.

## Common mistakes

- Running a separate BFS from each rotten orange and adding times, instead of one BFS from all of them.
- Counting a final minute in which nothing rots.
- Returning 0 instead of −1 when fresh oranges remain unreachable.

## In the interview

- Say "multi-source BFS, one wave per minute" and why the waves give the earliest time.
- Likely follow-ups:
  - *Distance from each cell to the nearest source?* The same BFS, storing distances (01 Matrix, Walls and Gates).
  - *Different spreading speeds per cell?* Weighted times need Dijkstra.
