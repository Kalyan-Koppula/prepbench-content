**Key idea:** instead of following water downhill from every cell, work backwards from the oceans. From each ocean's edge cells, walk **uphill** (to neighbours at least as high): every cell you reach can drain into that ocean. Do this once for each ocean; the cells reached by both searches are the answer.

## Recognising the pattern

Asking "can this cell reach a target?" for every cell is expensive; asking "which cells can the target be reached from?" once is cheap. That reversal is a key idea in the [Graphs](/problems/patterns/graphs) sheet, used again in Surrounded Regions. Here the edges are directed (water only flows downhill), so the reverse search walks uphill.

## Brute force

For every cell, follow water downhill with DFS and record whether it ever reaches a Pacific edge and an Atlantic edge. That is the reference brute force below. Each search can visit the whole grid: `O((m · n)²)`.

## Reverse search from both oceans

1. Pacific starting cells: the top row and the left column. Atlantic: the bottom row and the right column.
2. `climbFrom(starts)`: DFS from all the starting cells, moving to a neighbour only if its height is `>=` the current cell's height. Return the visited grid.
3. Run it for both oceans and return the cells marked in both grids.

**Why `>=` uphill.** Water flows from a cell to a neighbour that is **lower or equal**. Reversing that edge, the search moves from a cell to a neighbour that is **higher or equal**.

## Walkthrough

```
1 2 2 3 5
3 2 3 4 4
2 4 5 3 1
6 7 1 4 5
5 1 1 2 4
```

Cells reachable uphill from the Pacific (top/left) and from the Atlantic (bottom/right) overlap at `[0,4], [1,3], [1,4], [2,2], [3,0], [3,1], [4,0]`. For example, `(2, 2)` with height 5 flows left and up through `4 → 2` to the Pacific, and right and down through `3 → 1` to the Atlantic.

## Complexity

- Search from every cell: time `O((m · n)²)`, space `O(m · n)`.
- Reverse search: time `O(m · n)`, two traversals that each visit a cell at most once. Space `O(m · n)` for the two visited grids.

## Edge cases

- A single cell: touches both oceans.
- One row or one column: every cell touches both oceans.
- A flat grid: every cell can reach both oceans.

## Common mistakes

- Walking downhill in the reverse search, which answers the wrong question.
- Using `>` instead of `>=`, which blocks water on flat ground.
- Forgetting that corner cells start both searches (top-right and bottom-left each border both oceans).

## In the interview

- Explain the reversal before coding; it is the insight being tested.
- Likely follow-ups:
  - *Cells that reach at least one ocean?* The union instead of the intersection.
  - *Lowest water level needed to connect two cells?* A minimax path, solved with binary search plus BFS or with Dijkstra (Swim in Rising Water).
