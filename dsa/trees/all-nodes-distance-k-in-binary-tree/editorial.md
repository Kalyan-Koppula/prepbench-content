**Key idea:** distance in a tree can go up through ancestors, but tree nodes only point down. Add the missing upward links by recording each node's parent, then the tree is just an undirected graph: run a BFS from the target for exactly `k` levels, and the last level is the answer.

## Recognising the pattern

"All nodes at distance `k`" is a BFS question, and the only obstacle is that a tree isn't traversable upward. Turning the tree into a graph by adding parent edges is a standard trick from the [Trees](/problems/patterns/trees) sheet, and connects it to the BFS template of the [Graphs](/problems/patterns/graphs) sheet.

## Brute force

Record the root-to-node path of every node. For each node, the distance to the target is `depth(node) + depth(target) − 2 · depth(their LCA)`, and the LCA's depth is the length of the shared path prefix. Keep the nodes whose distance is `k`. That is the reference brute force below.

Correct, but storing and comparing a path per node costs `O(n · h)` time and space: `O(n²)` for a chain.

## Optimal: parent map plus BFS

1. **Parents.** Traverse the tree (DFS or BFS), storing `parent[child] = node` for every child, and remember the node whose value is the target.
2. **BFS from the target.** `frontier = [target]`, `visited = {target}`. Repeat `k` times: the next frontier is every unvisited neighbour (left child, right child, parent) of the current frontier, marking each as visited.
3. Return the values in the final frontier.

The `visited` set is what stops the search from going back the way it came: without it, a node's parent would step back down to it.

## Walkthrough

```
        3
      /   \
     5     1
    / \   / \
   6   2 0   8
      / \
     7   4
```

`target = 5`, `k = 2`:

| distance | frontier |
| --- | --- |
| 0 | 5 |
| 1 | 6, 2, 3 (children of 5 and its parent) |
| 2 | 7, 4 (children of 2), 1 (other child of 3) |

Answer `[7, 4, 1]` in any order.

## Complexity

- Paths: time `O(n · h)`, space `O(n · h)`.
- Parent map plus BFS: time `O(n)`, each node and edge handled once. Space `O(n)` for the map, the visited set and the queue.

## Edge cases

- `k = 0`: just the target.
- `k` larger than any distance: the frontier empties and the answer is `[]`.
- Target is the root: there is no parent edge from it.
- A chain: the BFS goes only up or only down.

## Common mistakes

- Only searching downward from the target.
- Forgetting the `visited` set and walking back and forth between a node and its parent.
- Looking up the target by value without the guarantee that values are distinct.

## In the interview

- Say "a tree is a graph if I add parent edges", then BFS.
- Mention the alternative without extra maps: a DFS that returns the distance to the target, and from each ancestor searches down into the other side for the remaining distance.
- Likely follow-ups:
  - *Nodes within distance `k`, not exactly `k`?* Collect every frontier along the way.
  - *Many queries with different targets?* Build the adjacency once, then BFS per query.
