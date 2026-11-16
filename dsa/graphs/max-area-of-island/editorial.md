**Key insight:** same component scan as Number of Islands — let each flood fill return the size of the component it swallowed, and keep the max.

## Approach

1. Scan every cell; on unvisited land start a DFS.
2. The DFS marks cells visited (set them to `0`) and counts how many it popped.
3. `best = max(best, area)` after each fill.

Recursive form: `area(r, c) = 0` if out of bounds or water, else sink the cell and return `1 + area of its four neighbours`.

## Complexity

- Time `O(m · n)` — each cell is sunk at most once.
- Space `O(m · n)` — stack depth for one huge island.

## Pitfalls

- Count when you mark, not when you push, or cells reachable from two neighbours get counted twice (if you mark on pop).
- Return `0`, not `-Infinity`, when there's no land.
- Union-find with component sizes is an equally valid answer; mention it if the grid is dynamic.
