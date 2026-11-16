---
title: Construct Binary Search Tree from Preorder Traversal
difficulty: Medium
order: 7
lists: [striver]
tags: [bst, recursion, stack]
leetcode: construct-binary-search-tree-from-preorder-traversal
function: bstFromPreorder
params:
  - { name: preorder, type: "number[]" }
returns: TreeNode
hints:
  - The first value is the root. Which of the following values belong to its left subtree?
  - Inserting the values one by one works, but can be quadratic. Instead, build recursively while passing down an upper bound — stop a subtree as soon as the next value exceeds it.
complexity: { time: "O(n)", space: "O(h)" }
---

You're given `preorder`, the preorder traversal (node, then left subtree, then right subtree) of a binary search tree with **distinct** values. Rebuild the tree and return its root.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `1 <= preorder.length <= 3000`
- `1 <= preorder[i] <= 10^5`, all distinct
- `preorder` is the preorder traversal of some binary search tree.
