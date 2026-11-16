---
title: Invert Binary Tree
difficulty: Easy
order: 1
lists: [neetcode150]
tags: [dfs, recursion]
leetcode: invert-binary-tree
function: invertTree
params:
  - { name: root, type: TreeNode }
returns: TreeNode
hints:
  - What does the mirror image of a single node look like, assuming its subtrees are already mirrored?
  - Swap the left and right child of every node — any traversal order works as long as each node is visited once.
complexity: { time: "O(n)", space: "O(h)" }
---

Given the `root` of a binary tree, mirror it: every node's left and right children trade places, all the way down. Return the root of the mirrored tree.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `0 <= number of nodes <= 10^4`
- `-100 <= Node.val <= 100`
