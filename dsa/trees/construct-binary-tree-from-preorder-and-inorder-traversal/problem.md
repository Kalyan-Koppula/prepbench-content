---
title: Construct Binary Tree from Preorder and Inorder Traversal
difficulty: Medium
order: 15
lists: [neetcode150, striver]
tags: [recursion, hash-map, divide-and-conquer]
leetcode: construct-binary-tree-from-preorder-and-inorder-traversal
function: buildTree
params:
  - { name: preorder, type: "number[]" }
  - { name: inorder, type: "number[]" }
returns: TreeNode
hints:
  - The first value of the preorder sequence is the root.
  - Find that value in the inorder sequence — everything to its left forms the left subtree, everything to its right the right subtree.
  - Store inorder positions in a hash map and consume preorder with a moving index to avoid slicing arrays.
complexity: { time: "O(n)", space: "O(n)" }
---

You're given two arrays describing the same binary tree with **distinct** values: `preorder` (node, then left subtree, then right subtree) and `inorder` (left subtree, then node, then right subtree). Rebuild the tree and return its root.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `1 <= preorder.length <= 3000`
- `inorder.length === preorder.length`
- `-3000 <= values <= 3000`, all distinct
- Both arrays are valid traversals of one binary tree.
