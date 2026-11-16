**Key insight:** a tree with parent pointers is just an undirected graph — BFS from the target for `k` steps.

## Approach

1. DFS/BFS once to build `parent: Map<TreeNode, TreeNode | null>` and to locate the target node by value.
2. BFS from the target, level by level, with a `visited` set. Each node's neighbours are `left`, `right` and `parent`.
3. After `k` levels, the frontier is the answer. If the frontier empties first, return `[]`.

## Complexity

- Time `O(n)` — the parent pass and the BFS each touch every node at most once.
- Space `O(n)` for the parent map, visited set and queue.

## Alternatives to mention

- **Recursive "distance to target" without a parent map:** a DFS returns the distance from each node to the target (or `-1`). When an ancestor at distance `d` is found, collect nodes at depth `k - d - 1` in its *other* subtree (or the ancestor itself when `d === k`). `O(n)` time, `O(h)` space, but trickier to get right under pressure.

## Pitfalls

- Forgetting the `visited` set: from a child you'd step back to its parent and then down to the child again.
- `k = 0` → the answer is `[target]`.
- Interviewers often follow up with *Minimum Time to Burn a Binary Tree* — the same parent-map BFS, returning the number of levels instead.
- The original problem passes the target as a node reference; here it is a value, which is safe because values are unique.
