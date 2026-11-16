**Key insight:** same shape as diameter — at each node, the best path *bending here* is `val + max(0, leftGain) + max(0, rightGain)`, but the parent can only extend one branch, so you return `val + max(0, leftGain, rightGain)`.

## Approach

1. `gain(node)`: the best sum of a path that starts at `node` and goes downward (possibly just `node`). `gain(null) = 0`.
2. Clamp children's gains at `0` — a negative branch is simply not taken.
3. Update `best = max(best, node.val + left + right)` — the best path whose top is this node.
4. Return `node.val + max(left, right)`.
5. Initialise `best` to `-Infinity` (or `root.val`), never `0`.

## Complexity

- Time `O(n)` — one post-order pass.
- Space `O(h)` recursion.

## Alternatives to mention

- Recomputing the best downward path from scratch for every candidate top node: `O(n²)`. Shows you understand the structure; then memoise by computing it bottom-up once.

## Pitfalls

- **All negative values**: initialising `best = 0` returns `0` for a tree like `[-3]`, but a path must contain at least one node.
- Returning `val + left + right` to the parent — that's a bent path, which the parent can't extend.
- Forgetting to clamp at `0` makes the solution drag along negative subtrees.
