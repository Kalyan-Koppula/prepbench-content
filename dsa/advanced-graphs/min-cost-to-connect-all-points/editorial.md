**Key idea:** connecting every point with exactly one path between any two, at minimum total cost, is a **minimum spanning tree**. Every pair of points has an edge (their Manhattan distance), so the graph is complete. Prim's algorithm with a plain array fits dense graphs: grow the tree one point at a time, always adding the outside point that is cheapest to connect.

## Recognising the pattern

"Connect everything with the least total cost, no cycles" is the MST question in the [Advanced Graphs](/problems/patterns/advanced-graphs) sheet. The two standard algorithms are Kruskal (sort edges, add with union-find) and Prim (grow from one node).

## Alternative: Kruskal (shown below)

List all `n(n−1)/2` edges, sort them by cost, and add each edge that connects two different components (union-find), stopping at `n − 1` edges. That is the reference brute force below. Correct, but with 1,000 points it creates and sorts about 500,000 edges: `O(n² log n)` time and `O(n²)` memory.

## Prim with an array

1. `cheapest[i]` = the cheapest edge connecting point `i` to the current tree; start with `cheapest[0] = 0` and ∞ for the rest.
2. Repeat `n` times:
   1. Pick the point `u` not yet in the tree with the smallest `cheapest[u]`. Add it, and add `cheapest[u]` to the total.
   2. For every point `v` still outside, update `cheapest[v]` with the distance from `u` if that is smaller.
3. Return the total.

**Why adding the cheapest connection is safe.** For any split of points into "in the tree" and "outside", the cheapest edge crossing the split belongs to some minimum spanning tree (the cut property). Prim always adds exactly that edge.

On a complete graph the array version is `O(n²)`, which beats a heap-based Prim (`O(n² log n)` over `n²` edges).

## Walkthrough

`points = [[0,0], [2,2], [3,10], [5,2], [7,0]]`

| add | cost | updates |
| --- | --- | --- |
| (0,0) | 0 | (2,2):4, (3,10):13, (5,2):7, (7,0):7 |
| (2,2) | 4 | (3,10):9, (5,2):3 |
| (5,2) | 3 | (7,0):4 |
| (7,0) | 4 | – |
| (3,10) | 9 | – |

Total `20`.

## Complexity

- Kruskal: time `O(n² log n)`, space `O(n²)`.
- Prim with an array: time `O(n²)`, space `O(n)`.

## Edge cases

- One point: cost 0.
- Points on a line: the MST is the chain of neighbours.
- Large coordinates: distances fit easily in a 64-bit number (or a double).

## Common mistakes

- Building all edges for Prim when an array of cheapest connections is enough.
- Adding the edge's cost when the point is first seen instead of when it joins the tree.
- Using Euclidean distance instead of Manhattan.

## In the interview

- Name MST, compare Kruskal and Prim, and choose Prim with an array because the graph is complete.
- Likely follow-ups:
  - *Sparse graph?* Kruskal or heap-based Prim, `O(E log V)`.
  - *Some connections are free or forbidden?* Kruskal with those edges added first or left out.
