**Key insight:** compute heights bottom-up and let an unbalanced subtree poison the result with `-1`, so each node is visited once.

## Approach

1. `check(null) = 0`.
2. For a node, get `l = check(left)` and `r = check(right)`.
3. If either is `-1`, or `|l - r| > 1`, return `-1`.
4. Otherwise return `1 + max(l, r)`.

The tree is balanced iff `check(root) !== -1`.

## Complexity

- Time `O(n)`, space `O(h)`.

## Alternatives to mention

- Top-down: at each node call a separate `height()` on both children and recurse. Correct but `O(n²)` on a skewed tree (`O(n log n)` when balanced). It's a fine first answer — then fuse the two passes.
- Returning a pair `[balanced, height]` instead of the `-1` sentinel is equally good and sometimes clearer.

## Pitfalls

- Only comparing the root's two subtree heights: a tree can have equal heights at the root and still be lopsided further down.
