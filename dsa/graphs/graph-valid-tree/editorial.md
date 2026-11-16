**Key insight:** a graph on `n` nodes is a tree ⇔ it has exactly `n - 1` edges **and** is connected (⇔ `n - 1` edges and acyclic). Check the edge count first, then any one of the other two.

## Approach (union-find)

1. If `edges.length !== n - 1`, return `false` — too few edges can't connect everything; too many must create a cycle.
2. Union the endpoints of each edge. If an edge's endpoints already share a root, it closes a cycle → `false`.
3. Otherwise return `true`: `n - 1` edges with no cycle form a single tree.

## Complexity

- Time `O(V + E · α(V))`.
- Space `O(V)`.

## Alternatives to mention

- **DFS/BFS from node 0** tracking each node's parent: seeing a visited node that isn't your parent is a cycle; afterwards check that all `n` nodes were visited. `O(V + E)`.

## Pitfalls

- Checking only "no cycle" accepts a forest, e.g. `n = 4` with edges `[[0,1],[2,3]]`. Checking only the edge count accepts a triangle plus an isolated node.
- In undirected DFS, the edge back to your parent is not a cycle.
- `n = 1` with no edges is a valid tree.
