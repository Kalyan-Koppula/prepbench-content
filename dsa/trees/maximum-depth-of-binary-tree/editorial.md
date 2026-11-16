**Key insight:** `depth(node) = 1 + max(depth(left), depth(right))`, with `depth(null) = 0` — the textbook post-order recursion.

## Approach

1. Base case: a missing node contributes `0`.
2. Otherwise ask both children for their depth and add one for the current node.

## Complexity

- Time `O(n)` — each node is visited once.
- Space `O(h)` for the recursion: `O(log n)` balanced, `O(n)` skewed.

## Alternatives to mention

- **BFS**: count how many levels the level-order loop processes. `O(n)` time, `O(w)` space (widest level); no recursion-depth concerns.
- **Iterative DFS** with a stack of `[node, depth]` pairs, tracking the max depth seen.

## Pitfalls

- Depth here counts nodes, not edges. Some follow-ups (height, diameter) count edges — say which you mean.
