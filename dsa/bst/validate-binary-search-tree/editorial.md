**Key idea:** every node must lie strictly between bounds set by **all** of its ancestors, not just its parent. Pass an allowed range `(low, high)` down the recursion: a left child gets the parent's value as its new upper bound, a right child as its new lower bound.

## Recognising the pattern

This is the defining check of the [Binary Search Trees](/problems/patterns/bst) sheet, and it uses the top-down shape from the [Trees](/problems/patterns/trees) sheet: constraints flow from the root down through parameters. The classic trap is checking only parent and child.

## Brute force

At every node, scan its whole left subtree to confirm every value is smaller, and its whole right subtree to confirm every value is larger, then recurse. That is the reference brute force below.

Correct by definition, but each node scans its subtrees again: `O(n²)` for a chain-shaped tree.

## Optimal: bounds passed down

`isWithin(node, low, high)`:

1. If `node` is null, return `true`.
2. If `node.val <= low` or `node.val >= high`, return `false`.
3. Return `isWithin(node.left, low, node.val) && isWithin(node.right, node.val, high)`.

Start with `isWithin(root, −∞, ∞)`. The comparisons are strict because equal values are not allowed.

**Why the bounds work.** A node in the left subtree of `a` and the right subtree of `b` must be smaller than `a` and larger than `b`. Each step down tightens one side of the range, so the range at a node is exactly the set of values its position allows.

**Equivalent check: inorder.** A tree is a valid BST exactly when its inorder traversal is strictly increasing. Track the previous value during an inorder walk and fail on any value that is not larger. Same `O(n)`.

## Walkthrough

```
      5
     / \
    1   4
       / \
      3   6
```

| node | allowed range | ok? |
| --- | --- | --- |
| 5 | (−∞, ∞) | yes |
| 1 | (−∞, 5) | yes |
| 4 | (5, ∞) | **no**, 4 ≤ 5 |

The tree is invalid: `4` is in the right subtree of `5`. A subtler case is `[5, 4, 6, null, null, 3, 7]`: node `3` is the left child of `6`, so it passes the parent check (3 < 6), but its range is `(5, 6)`, and it fails.

## Complexity

- Brute force: time `O(n²)` worst case, space `O(h)`.
- Bounds: time `O(n)`, space `O(h)` for recursion.
- Inorder with a previous value: time `O(n)`, space `O(h)`.

## Edge cases

- Empty tree or one node: valid.
- Equal values anywhere: invalid, which the strict comparisons enforce.
- Values at the extremes of the integer range: use `±∞` bounds (or nulls), not `±2^31`.

## Common mistakes

- Comparing each node only with its children.
- Using `<` and `>` instead of `<=` and `>=` in the failure test, so duplicates pass.
- Initial bounds set to the 32-bit limits, which wrongly reject trees containing those values.

## In the interview

- Show the counter-example where every parent/child pair is fine but the tree is invalid. It proves you understand the property.
- Mention the inorder alternative.
- Likely follow-ups:
  - *Duplicates allowed on one side?* Make the bound on that side inclusive.
  - *Largest BST subtree inside a binary tree?* Bottom-up: return each subtree's min, max, size and validity.
