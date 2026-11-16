**Key insight:** add edges in input order with union-find. The first edge whose endpoints already share a root closes the cycle — and since every cycle edge must be present before the cycle closes, that edge is the cycle edge that appears last.

## Approach

1. `parent[i] = i` for nodes `1..n`.
2. For each `[a, b]` in order: if `find(a) === find(b)`, return `[a, b]`. Otherwise union them.

Only edges on the cycle can be removed (removing any other disconnects the graph), so "last cycle edge in the input" is exactly the requested answer.

## Complexity

- Time `O(n · α(n))` — one find/union per edge.
- Space `O(n)`.

## Alternatives to mention

- Brute force: for each edge from last to first, drop it and check whether the rest is connected (DFS). `O(n²)`.
- DFS before adding each edge ("is `b` already reachable from `a`?"): also `O(n²)`.

## Follow-ups

- **Redundant Connection II** makes the graph directed (a rooted tree plus one edge). Then a node may have two parents, and you must handle that case separately from the plain cycle case.
