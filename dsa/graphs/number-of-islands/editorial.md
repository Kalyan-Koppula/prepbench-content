**Key idea:** scan the grid. Every time you find land that hasn't been visited, you've found a new island: count it, then flood-fill the whole island so none of its cells start another count. The number of flood fills is the number of islands.

## Recognising the pattern

Counting groups of connected cells is counting **connected components**, the most common grid question in the [Graphs](/problems/patterns/graphs) sheet. Any traversal (DFS, BFS) or union-find works.

## Alternative: union-find (shown below)

Start with every land cell as its own island. For each pair of adjacent land cells, merge their sets; each successful merge reduces the island count by one. That is the reference brute force below. Same `O(m · n · α)` complexity, useful when land is added over time (Number of Islands II).

## Flood fill from every unvisited land cell

1. `islands = 0`.
2. For each cell: if it is `"1"`:
   1. `islands++`.
   2. Set it to `"0"` and push it on a stack. While the stack isn't empty, pop a cell and push every neighbouring `"1"`, setting each to `"0"` when pushed.
3. Return `islands`.

Changing land to water marks it visited without a separate array. If you mustn't modify the input, use a `visited` grid instead.

## Walkthrough

```
1 1 0 0 0
1 1 0 0 0
0 0 1 0 0
0 0 0 1 1
```

| scan reaches | action | islands |
| --- | --- | --- |
| (0, 0) | new island; sink the 2×2 block | 1 |
| (2, 2) | new island; sink that one cell | 2 |
| (3, 3) | new island; sink (3, 3) and (3, 4) | 3 |

Answer `3`. Diagonal neighbours like (2, 2) and (3, 3) are separate islands.

## Complexity

- DFS or BFS: time `O(m · n)`, each cell visited a constant number of times. Space `O(m · n)` for the stack in the worst case.
- Union-find: time `O(m · n · α(m · n))`, space `O(m · n)` for the parent array.

## Edge cases

- No land: 0.
- All land: 1.
- A checkerboard: every land cell is its own island.

## Common mistakes

- Counting diagonal neighbours as connected.
- Marking cells visited when popping instead of when pushing, which pushes the same cell several times.
- Recursion depth on large grids (up to 90,000 cells here).

## In the interview

- Explain "each flood fill finds exactly one island".
- Likely follow-ups:
  - *Islands added one cell at a time?* Union-find, merging with existing neighbours on each addition.
  - *Largest island?* Count cells during the fill (Max Area of Island).
  - *Distinct island shapes?* Record each island's cells relative to its first cell, and count distinct shapes.
