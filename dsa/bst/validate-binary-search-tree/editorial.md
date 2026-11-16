**Key insight:** each node inherits an allowed range from its ancestors — going left caps the maximum, going right raises the minimum.

## Approach

1. `valid(node, lo, hi)`: a null node is valid.
2. The node fails if `node.val <= lo` or `node.val >= hi` (strict, so duplicates fail).
3. Recurse: `valid(left, lo, node.val) && valid(right, node.val, hi)`.
4. Start with `(-Infinity, Infinity)`.

## Complexity

- Time `O(n)`, space `O(h)`.

## Alternatives to mention

- **Inorder with a `prev` value**: the traversal must be strictly increasing. Can stop at the first violation; iterative with a stack avoids deep recursion.
- **Brute force**: for each node, scan its whole left and right subtrees for the max/min — `O(n²)` worst case.

## Pitfalls

- **Parent-child only check**: `[5,3,8,1,6]` passes local checks (6 > 3) but 6 sits in 5's left subtree.
- **Sentinel bounds**: values reach `±2^31`, so using `-2^31` / `2^31 - 1` as initial bounds wrongly rejects a node holding that exact value. Use `±Infinity` (or `null`).
- **Duplicates**: confirm the rule. Here equal values are invalid on both sides.
