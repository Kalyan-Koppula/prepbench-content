---
title: Lowest Common Ancestor of a Binary Search Tree
difficulty: Medium
order: 4
lists: [neetcode150, striver]
tags: [bst]
leetcode: lowest-common-ancestor-of-a-binary-search-tree
function: lowestCommonAncestor
params:
  - { name: root, type: TreeNode }
  - { name: p, type: number }
  - { name: q, type: number }
returns: number
hints:
  - If both values are smaller than the current node, where must their common ancestor be?
  - Walk down from the root; the first node whose value lies between `p` and `q` (inclusive) is the answer.
complexity: { time: "O(h)", space: "O(1)" }
---

You're given the `root` of a binary search tree with **distinct** values, and two different values `p` and `q` that both appear in it.

Return the value of their **lowest common ancestor**: the deepest node that has both the `p` node and the `q` node in its subtree. A node is considered part of its own subtree, so if one target is an ancestor of the other, it is the answer.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `2 <= number of nodes <= 10^4`
- `-10^9 <= Node.val <= 10^9`, all values distinct
- `root` is a valid binary search tree.
- `p !== q`, and both are values in the tree
