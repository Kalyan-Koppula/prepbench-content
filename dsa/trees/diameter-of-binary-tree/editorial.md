**Key insight:** every path bends at exactly one node; at that node its length is `height(left) + height(right)`. One post-order pass computes heights and checks every bend point.

## Approach

1. Define `height(node)` = nodes on the longest downward path (`0` for null).
2. In the same recursion, after getting `l = height(left)` and `r = height(right)`, update `best = max(best, l + r)` — that's the edge count of the longest path bending here.
3. Return `1 + max(l, r)` to the parent, because the parent can only extend one branch.

This "return one thing, record another" shape reappears in max path sum and longest univalue path.

## Complexity

- Time `O(n)` — each node is visited once.
- Space `O(h)` recursion stack.

## Alternatives to mention

- Calling a separate `height()` for every node is `O(n²)` on a skewed tree — the usual first draft. Explain why fusing them fixes it.

## Pitfalls

- Edges vs nodes: `l + r` counts edges when `height` counts nodes. A single node has diameter `0`.
- Returning `max(diameter)` from the root's subtrees alone misses paths that don't touch the root — that's why the answer lives in an outer variable.
