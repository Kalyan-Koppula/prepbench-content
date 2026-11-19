**Key idea:** start with every node as its own component and process the edges with **union-find**. An edge that joins two different components merges them and reduces the count by one; an edge inside one component changes nothing. The final count is the answer.

## Recognising the pattern

Counting connected components with the edges given as a list is the home ground of union-find in the [Graphs](/problems/patterns/graphs) sheet. A DFS or BFS over an adjacency list works equally well.

## Alternative: DFS from every unvisited node (shown below)

Build adjacency lists. Each time you meet an unvisited node, count a new component and DFS to mark everything reachable. That is the reference brute force below. `O(V + E)` time and space.

## Union-find

- `parent[i]` points toward the representative (root) of `i`'s component; roots point to themselves.
- `findRoot(x)` follows parents to the root, halving the path as it goes (`parent[x] = parent[parent[x]]`), which keeps the trees shallow.
- **Union by size:** attach the smaller tree under the larger one.

1. `components = n`.
2. For each edge `[a, b]`: find both roots. If they differ, attach the smaller tree to the larger and decrement `components`.
3. Return `components`.

With path halving and union by size, each operation takes amortised `O(α(n))`, where `α` is the inverse Ackermann function: at most 4 or 5 for any real input.

## Walkthrough

`n = 5`, `edges = [[0, 1], [1, 2], [3, 4]]`

| edge | roots | merge? | components |
| --- | --- | --- | --- |
| start | – | – | 5 |
| [0, 1] | 0, 1 | yes | 4 |
| [1, 2] | 0, 2 | yes | 3 |
| [3, 4] | 3, 4 | yes | 2 |

Answer `2`: `{0, 1, 2}` and `{3, 4}`.

## Complexity

- DFS: time `O(V + E)`, space `O(V + E)` for the adjacency lists.
- Union-find: time `O(V + E · α(V))`, space `O(V)`.

## Edge cases

- No edges: `n` components.
- Duplicate or redundant edges: the root check ignores them.
- One node: 1.

## Common mistakes

- Comparing `parent[a]` and `parent[b]` instead of their roots.
- Forgetting to decrement only when a merge actually happens.
- Recursive `find` without path compression on long chains, which is slow and can overflow the stack.

## In the interview

- Offer both, then explain why union-find suits an edge list and incremental edges.
- Likely follow-ups:
  - *Edges arrive over time; report the count after each?* Union-find answers each step in near-constant time.
  - *Is the graph a tree?* Exactly `n − 1` edges and no edge inside a component (Graph Valid Tree).
