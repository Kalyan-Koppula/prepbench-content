**Key idea:** add the edges one by one with union-find. The graph was a tree before one extra edge was added, so exactly one edge joins two nodes that are **already** connected: the first edge whose endpoints share a root. That edge closes the cycle, and it is also the cycle edge that appears last in the input.

## Recognising the pattern

Detecting the edge that creates a cycle in an undirected graph, as edges arrive, is the textbook use of union-find in the [Graphs](/problems/patterns/graphs) sheet.

## Brute force

Try removing each edge, starting from the last, and check whether the remaining edges connect all `n` nodes; since `n − 1` connected edges form a tree, the first edge that works is the answer. That is the reference brute force below. Each check is a full DFS: `O(n²)`.

## Union-find

1. `parent[i] = i` for nodes `1..n`.
2. For each edge `[a, b]` in input order:
   1. Find both roots.
   2. If they are equal, `a` and `b` were already connected: return this edge.
   3. Otherwise union them.

**Why it is the last cycle edge.** Before the edge that closes the cycle, all the other cycle edges have been added (they connected `a` and `b`). Every edge of the cycle could be removed to leave a tree, and the one processed last among them is exactly the one that finds both ends already connected.

## Walkthrough

`edges = [[1, 2], [1, 3], [2, 3]]`

| edge | roots | action |
| --- | --- | --- |
| [1, 2] | 1, 2 | union |
| [1, 3] | 2, 3 | union |
| [2, 3] | 3, 3 | same root → return [2, 3] |

## Complexity

- Remove and check: time `O(n²)`, space `O(n)`.
- Union-find: time `O(n · α(n))`, space `O(n)`.

## Edge cases

- The cycle includes the very first edges: still found when its last edge arrives.
- A cycle of length 3, the smallest possible here.

## Common mistakes

- Returning the first edge of the cycle rather than the one that closes it.
- Sizing the parent array for `0..n−1` when nodes are labelled `1..n`.
- Comparing direct parents instead of roots.

## In the interview

- Explain why the first edge with matching roots is the required answer.
- Likely follow-ups:
  - *Directed graph (Redundant Connection II)?* A node may have two parents, or there may be a cycle, or both; handle the cases with in-degree checks plus union-find.
  - *Find all edges on the cycle?* DFS to find the cycle path, or remove leaves repeatedly until only the cycle remains.
