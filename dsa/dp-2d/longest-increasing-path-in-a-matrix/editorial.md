**Key idea:** the longest increasing path **starting** at a cell is 1 plus the longest one starting at any larger neighbour. Paths only go to strictly larger values, so they can never loop back: the "starts at" values form a DAG and can be cached. Compute each cell once with DFS and memoisation, and take the maximum over all cells.

## Recognising the pattern

A grid where moves are allowed in all four directions would normally need graph search, but the strictly increasing rule removes cycles. A DAG plus "longest path" is DP over a topological order, as in the [2-D Dynamic Programming](/problems/patterns/dp-2d) sheet; memoised DFS finds that order automatically.

## Alternative: topological layers (shown below)

Count, for each cell, how many neighbours are smaller. Cells with none are the start of every path: the first layer. Remove them and decrease the counts of their larger neighbours; cells reaching zero form the next layer. The number of layers is the length of the longest path, because each layer extends paths by one step. That is Kahn's algorithm, the reference brute force below. `O(m · n)` as well, with no recursion.

Plain DFS from every cell without memoisation re-explores the same paths and is exponential.

## Memoised DFS

1. `memo[r][c] = 0` means "not computed yet".
2. `longestFrom(r, c)`:
   1. If computed, return it.
   2. `best = 1`. For each of the four neighbours that is inside the grid and **strictly larger**: `best = max(best, 1 + longestFrom(neighbour))`.
   3. Store and return `best`.
3. The answer is the maximum of `longestFrom` over all cells.

**Why no visited set.** In ordinary DFS, a visited set stops cycles. Here a path can't revisit a cell, because values strictly increase along it. Memoisation is purely for speed.

## Walkthrough

`matrix = [[5, 1, 9], [6, 2, 8], [7, 3, 4]]`. Values of `longestFrom` for each cell:

|  | col 0 | col 1 | col 2 |
| --- | --- | --- | --- |
| row 0 | 5 → **3** | 1 → **6** | 9 → **1** |
| row 1 | 6 → **2** | 2 → **5** | 8 → **2** |
| row 2 | 7 → **1** | 3 → **4** | 4 → **3** |

For example, `3` has larger neighbours `7` (1) and `4` (3), so `1 + 3 = 4`. The best start is `1`: 1 → 2 → 3 → 4 → 8 → 9, length `6`.

## Complexity

- DFS without memo: exponential.
- Memoised DFS: `O(m · n)` time (each cell computed once, four neighbours each), `O(m · n)` space for the memo and up to `O(m · n)` recursion depth.
- Topological layers: `O(m · n)` time and space, no recursion.

## Edge cases

- All values equal: 1.
- A single cell: 1.
- A long snake-shaped path: the recursion can get deep; mention the layered version if stack depth is a concern.

## Common mistakes

- Allowing equal neighbours (`>=`), which creates cycles and infinite recursion.
- Adding a visited set that is cleared between starts, which turns it back into exponential search.
- Returning the memo value of the top-left cell instead of the maximum over all cells.

## In the interview

- Point out that strictly increasing paths make the graph acyclic; that justifies the memo.
- Likely follow-ups:
  - *Return the path?* Store the best next cell for each cell, then follow it from the best start.
  - *Non-decreasing paths?* Equal neighbours create cycles; group equal-valued cells into components first.
  - *Count all increasing paths?* Same memo, summing instead of taking a max.
