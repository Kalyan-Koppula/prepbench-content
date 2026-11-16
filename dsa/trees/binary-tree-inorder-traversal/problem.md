---
title: Binary Tree Inorder Traversal
difficulty: Easy
order: 4
lists: [striver]
tags: [dfs, stack, traversal]
leetcode: binary-tree-inorder-traversal
function: inorderTraversal
params:
  - { name: root, type: TreeNode }
returns: "number[]"
hints:
  - Inorder means left subtree, then the node, then the right subtree.
  - To do it without recursion, push the whole left spine onto a stack, pop a node, visit it, then move to its right child.
complexity: { time: "O(n)", space: "O(h)" }
---

Given the `root` of a binary tree, return the values of its nodes in **inorder**: for every node, its entire left subtree comes first, then the node itself, then its entire right subtree.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `0 <= number of nodes <= 10^4`
- `-100 <= Node.val <= 100`

**Follow-up:** the recursive version is a few lines. Write it iteratively with an explicit stack — and, if you can, with `O(1)` extra space.
