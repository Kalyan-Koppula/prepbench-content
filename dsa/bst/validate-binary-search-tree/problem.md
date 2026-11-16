---
title: Validate Binary Search Tree
difficulty: Medium
order: 2
lists: [neetcode150, striver]
tags: [bst, dfs, inorder]
leetcode: validate-binary-search-tree
function: isValidBST
params:
  - { name: root, type: TreeNode }
returns: boolean
hints:
  - Comparing each node only with its direct children isn't enough — a value deep in the left subtree must still be smaller than the root.
  - Pass down the open interval `(low, high)` that a node's value must fall into, tightening it as you go left or right.
  - Alternatively, an inorder traversal of a valid BST is strictly increasing.
complexity: { time: "O(n)", space: "O(h)" }
---

Given the `root` of a binary tree, return `true` if it is a valid **binary search tree**:

- every value in a node's left subtree is strictly less than the node's value,
- every value in its right subtree is strictly greater,
- and both subtrees are themselves binary search trees.

Equal values are therefore not allowed anywhere in a valid tree.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `1 <= number of nodes <= 10^4`
- `-2^31 <= Node.val <= 2^31 - 1`
