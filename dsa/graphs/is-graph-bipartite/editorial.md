**Key idea:** try to 2-colour the graph. Give a starting node colour 0, every neighbour colour 1, their neighbours colour 0, and so on, with BFS. If an edge ever connects two nodes of the same colour, the graph isn't bipartite. Repeat from every uncoloured node, since the graph may be disconnected.

## Recognising the pattern

"Split nodes into two groups so every edge crosses between them" is graph 2-colouring, a BFS/DFS traversal from the [Graphs](/problems/patterns/graphs) sheet that carries one bit of state per node. A graph is bipartite exactly when it has no cycle of odd length.

## Alternative: union-find (shown below)

For each node `u`, all its neighbours must be on the same side (the side opposite `u`), so union them together; if `u` ever ends up in the same set as one of its neighbours, it fails. That is the reference brute force below. Same near-linear complexity; BFS colouring is simpler to explain.

## BFS colouring

1. `side` = all −1 (uncoloured).
2. For every node `start` still uncoloured: colour it 0 and BFS from it.
   - For each neighbour `v` of the current node `u`: if uncoloured, give it `1 − side[u]` and enqueue it; if coloured the same as `u`, return `false`.
3. Return `true`.

The BFS assigns colours that alternate along every path from the start. A conflict means two paths of different parity reach the same node, which closes an odd cycle.

## Walkthrough

`graph = [[1, 3], [0, 2], [1, 3], [0, 2]]` (a square 0-1-2-3-0)

| visit | colour | neighbours coloured |
| --- | --- | --- |
| 0 | 0 | 1 → 1, 3 → 1 |
| 1 | 1 | 2 → 0 |
| 3 | 1 | 2 already 0 (fine) |
| 2 | 0 | 1 and 3 are 1 (fine) |

Bipartite: `{0, 2}` and `{1, 3}`. A triangle `[[1, 2], [0, 2], [0, 1]]` fails: 1 and 2 both get colour 1, and they share an edge.

## Complexity

- Time `O(V + E)`: every node is coloured once and every edge checked twice.
- Space `O(V)` for the colours and the queue.

## Edge cases

- Isolated nodes: trivially fine.
- A disconnected graph: each component is checked separately.
- No edges at all: bipartite.

## Common mistakes

- Running BFS only from node 0, missing other components.
- Recolouring a node that already has a colour instead of checking it.
- Treating "visited" as enough; the colour, not just the visit, matters.

## In the interview

- Mention the odd-cycle characterisation; it explains why colouring works.
- Likely follow-ups:
  - *Return the two groups?* Collect nodes by colour.
  - *Possible Bipartition (people who dislike each other)?* Build the graph from the dislikes, then the same check.
