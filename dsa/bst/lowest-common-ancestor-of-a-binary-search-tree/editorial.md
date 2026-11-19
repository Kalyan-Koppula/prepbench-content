**Key idea:** in a BST you know which side each value is on. Walk down from the root: if both values are smaller than the current node, go left; if both are larger, go right. The first node where they fall on different sides (or that equals one of them) is the lowest common ancestor.

## Recognising the pattern

In a general tree the LCA needs a search of both subtrees. In a BST, the ordering tells you where each value lives, which turns the problem into a single walk down, the [Binary Search Trees](/problems/patterns/bst) sheet's `O(h)` search path.

## Brute force

Ignore the ordering: find the root-to-node path for each value with a DFS, and return the last node the two paths share. That is the reference brute force below. Time `O(n)`, space `O(h)`. It is exactly the general-tree solution.

## Optimal: walk down while both are on one side

1. `current = root`.
2. While `current` is not null:
   1. If `p` and `q` are both smaller than `current.val`, `current = current.left`.
   2. Else if both are larger, `current = current.right`.
   3. Else return `current.val`.

**Why the split point is the LCA.** While both values are on the same side, the current node is a common ancestor, but so is its child on that side, which is lower. At the split point, one value is in the left subtree and the other in the right (or one equals the current node), so no lower node contains both.

## Walkthrough

```
          6
        /   \
       2     8
      / \   / \
     0   4 7   9
        / \
       3   5
```

| p, q | node | comparison | action |
| --- | --- | --- | --- |
| 2, 8 | 6 | 2 < 6 < 8 | split → 6 |
| 2, 4 | 6 | both smaller | left |
| 2, 4 | 2 | equals p | → 2 |
| 3, 5 | 6 → 2 → 4 | at 4: 3 < 4 < 5 | split → 4 |

## Complexity

- Path comparison: time `O(n)`, space `O(h)`.
- BST walk: time `O(h)`, space `O(1)`.

## Edge cases

- One value is an ancestor of the other: the walk stops at it, because it equals one of the targets.
- One value is the root: answered at the first step.
- An unbalanced tree: still `O(h)`, which may be `O(n)`.

## Common mistakes

- Running the general binary-tree LCA, which works but wastes the ordering.
- Comparing with `<=` or `>=`, which steps past a node equal to a target.
- Assuming `p < q`. The conditions must work in either order, as written above.

## In the interview

- Mention that this only works because of the ordering, and contrast with the general-tree version.
- Likely follow-ups:
  - *General binary tree?* Post-order search returning the found node (Lowest Common Ancestor of a Binary Tree).
  - *Distance between two nodes?* `depth(p) + depth(q) − 2 · depth(LCA)`.
  - *Values might not be in the tree?* Verify both with searches first.
