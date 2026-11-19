**Key idea:** every path in a tree has one highest node, where it bends. The longest path bending at a node goes down its left side as far as possible and down its right side as far as possible: `height(left) + height(right)` edges. Compute heights bottom-up and track the largest such sum along the way.

## Recognising the pattern

The answer is a maximum over all nodes of something built from the two subtree heights. That is the "return one thing upward, record another globally" shape from the [Trees](/problems/patterns/trees) sheet: each call returns its height to its parent, and updates the best diameter seen so far as a side effect. Binary Tree Maximum Path Sum uses the same skeleton.

## Brute force

For each node, compute the heights of its two subtrees from scratch and take their sum; the answer is the largest sum over all nodes. That is the reference brute force below (written as "through this node, or entirely in the left subtree, or entirely in the right").

Correct, because the longest path bends at some node. But each node recomputes heights over its whole subtree, which is `O(n²)` for a chain-like tree. Space `O(h)`.

## Optimal: one post-order pass

1. `best = 0`.
2. `height(node)`:
   1. If `node` is null, return 0.
   2. `left = height(node.left)`, `right = height(node.right)`.
   3. `best = max(best, left + right)`. The path bending here has `left` edges going down-left and `right` edges going down-right.
   4. Return `1 + max(left, right)`.
3. Call `height(root)` and return `best`.

Heights are counted in **nodes**, so `height(left)` is also the number of edges from this node down into the left subtree's deepest node. That is why `left + right` is directly the path length in edges.

In JavaScript a closure variable would hold `best`. The reference solution passes a one-element array instead, which translates directly to languages without closures.

## Walkthrough

```
      1
     / \
    2   3
   / \
  4   5
```

| node | left height | right height | path bending here | best | returns |
| --- | --- | --- | --- | --- | --- |
| 4 | 0 | 0 | 0 | 0 | 1 |
| 5 | 0 | 0 | 0 | 0 | 1 |
| 2 | 1 | 1 | 2 | 2 | 2 |
| 3 | 0 | 0 | 0 | 2 | 1 |
| 1 | 2 | 1 | 3 | 3 | 3 |

Answer `3`: the path `4 → 2 → 1 → 3` (or `5 → 2 → 1 → 3`).

## Complexity

- Brute force: time `O(n²)` worst case, space `O(h)`.
- One pass: time `O(n)`, space `O(h)` for the recursion.

## Edge cases

- A single node: diameter 0.
- A chain: the diameter is `n − 1`, bending at the top.
- The longest path doesn't touch the root: the global `best` still catches it.

## Common mistakes

- Returning `left + right` instead of the height, so parents receive the wrong value.
- Only computing `height(root.left) + height(root.right)` for the root.
- Counting nodes instead of edges in the answer (off by one).

## In the interview

- Say "every path has a highest node", then explain why each call returns height but records diameter.
- Likely follow-ups:
  - *Maximum path sum of values?* Same skeleton with sums, ignoring negative branches (Binary Tree Maximum Path Sum).
  - *Diameter of a general tree or graph?* For trees, run BFS from any node to the farthest node, then BFS again from there.
