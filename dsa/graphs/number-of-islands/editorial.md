**Key insight:** count connected components of land. Each time a scan finds unvisited land, that's a new island — flood it so none of its cells is counted again.

## Approach

1. Loop over every cell.
2. On an unvisited `"1"`, increment the count and run DFS/BFS from it, marking every reachable land cell visited (here, by overwriting it with `"0"`).
3. Return the count.

## Complexity

- Time `O(m · n)` — every cell is visited a constant number of times.
- Space `O(m · n)` — the stack/queue when the whole grid is land.

## Alternatives to mention

- **Union-find:** union each land cell with its right and down land neighbours; islands = land cells − successful unions. Same complexity, and it supports cells being added later ("Number of Islands II").
- **BFS vs DFS:** identical result; BFS avoids deep recursion on large all-land grids.

## Pitfalls

- Sinking the input is a side effect — say so, or keep a separate `visited` grid if the caller needs the map.
- The values are strings: compare with `"1"`, not `1`.
- Diagonal land does not connect.
