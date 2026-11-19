**Key idea:** flood-fill each island once, counting its cells as you go. Each fill gives one island's area; the answer is the largest.

## Recognising the pattern

This is Number of Islands with a counter inside the fill: a connected-component traversal from the [Graphs](/problems/patterns/graphs) sheet, measuring component sizes instead of counting components.

## Alternative: recursive DFS with a visited grid (shown below)

`areaFrom(r, c)` returns 0 for water, out-of-bounds or visited cells; otherwise it marks the cell and returns `1 + ` the areas of its four neighbours. Run it from every cell and keep the maximum. That is the reference brute force below. Same complexity; it leaves the input unchanged but recursion can get deep.

## Iterative fill with counting

1. `best = 0`.
2. For each land cell:
   1. Sink it, push it, and set `area = 0`.
   2. While the stack isn't empty: pop a cell, `area++`, and push each neighbouring land cell (sinking it when pushed).
   3. `best = max(best, area)`.
3. Return `best`.

Counting on pop (each cell popped once) gives the exact size.

## Walkthrough

```
0 0 1 0 0
0 1 1 1 0
0 0 1 0 0
1 1 0 0 0
```

| island found at | cells | area | best |
| --- | --- | --- | --- |
| (0, 2) | (0,2) (1,1) (1,2) (1,3) (2,2) | 5 | 5 |
| (3, 0) | (3,0) (3,1) | 2 | 5 |

Answer `5`.

## Complexity

- Time `O(m · n)`, each cell visited once.
- Space `O(m · n)` for the stack (or the visited grid) in the worst case.

## Edge cases

- No land: 0.
- One big island covering the grid: `m · n`.
- Several islands of equal size: any gives the same maximum.

## Common mistakes

- Counting cells when they are pushed and again when popped.
- Resetting `area` in the wrong place, mixing two islands.
- Forgetting to mark cells, so an island is measured from each of its cells.

## In the interview

- Build it from Number of Islands: "same fill, plus a counter."
- Likely follow-ups:
  - *Flip one water cell to land to make the biggest island?* Label each island with its size, then for each water cell add the sizes of distinct neighbouring islands (Making a Large Island).
  - *Perimeter of the island?* Count land-to-water and land-to-border edges.
