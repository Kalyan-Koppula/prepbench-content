**Key insight:** a top-down DFS that carries "the max value on the path so far" can decide each node in O(1).

## Approach

1. `dfs(node, maxSoFar)`: if `node` is null return `0`.
2. The node is good iff `node.val >= maxSoFar`.
3. Recurse into both children with `max(maxSoFar, node.val)` and add up the counts.
4. Start with `dfs(root, -Infinity)` (or `root.val`).

## Complexity

- Time `O(n)`, space `O(h)` recursion.

## Alternatives to mention

- BFS/iterative DFS with `[node, maxSoFar]` pairs on the queue/stack — same complexity, no recursion limit.
- Brute force: for every node, walk its root path again — `O(n · h)`.

## Pitfalls

- Use `>=`: a node equal to the path maximum is still good.
- This is the canonical example of **top-down** state (passed as a parameter) as opposed to bottom-up (returned) — worth naming in the interview.
