**Key insight:** start with `n` components; every edge that joins two *different* components merges them and lowers the count by one. Union-find tells you which edges do that.

## Approach

1. `parent[i] = i`, `size[i] = 1`, `components = n`.
2. For each edge `[a, b]`, find both roots. If they differ, attach the smaller tree under the larger and decrement `components`.
3. Return `components`.

`find` uses path compression (point nodes straight at the root while walking up), so each operation is effectively constant.

## Complexity

- Time `O(V + E · α(V))` — `α` is the inverse Ackermann function, ≤ 4 for any real input.
- Space `O(V)` — the parent and size arrays.

## Alternatives to mention

- **DFS/BFS:** build adjacency lists, then count how many traversals it takes to visit all nodes. `O(V + E)` time and space. Equally good; union-find shines when edges arrive one at a time.

## Pitfalls

- Isolated nodes are components too — that's why the count starts at `n`, not at the number of nodes seen in `edges`.
- Without path compression or union by size, a chain of unions degrades `find` to `O(V)`.
