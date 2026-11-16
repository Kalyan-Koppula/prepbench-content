**Key insight:** try every node of `root` as the starting point of a *Same Tree* comparison with `subRoot`.

## Approach

1. `isSubtree(node)`: if `node` is null, no match here → `false`.
2. If `sameTree(node, subRoot)` → `true`.
3. Otherwise try `isSubtree(node.left)` or `isSubtree(node.right)`.

`sameTree` is the lockstep comparison: both null → true; one null or values differ → false; else recurse on both pairs of children.

## Complexity

- Time `O(m · n)` worst case (`m`, `n` = node counts): a same-tree check of up to `n` nodes from each of the `m` starting points. In practice mismatches stop early.
- Space `O(h)` recursion.

## Follow-ups

- **Serialise + substring search, `O(m + n)`:** pre-order serialise both trees with a null marker and a separator *before* every value (e.g. `,4,1,#,#,2,#,#`). Then `subRoot` is a subtree iff its string occurs in `root`'s string. Use KMP or Z-function for guaranteed linear time.
- Without the leading separator, value `2` would match the tail of `12`. Without null markers, different shapes collide.
- **Merkle hashing:** hash every subtree bottom-up from `(val, hashLeft, hashRight)` and look for `subRoot`'s hash; verify on hit to rule out collisions.

## Pitfalls

- Matching only the top part: `subRoot` must match a node *and every descendant*, so a node with extra children below is not a match.
