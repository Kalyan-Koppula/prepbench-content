---
title: Diameter of Binary Tree
difficulty: Easy
order: 5
lists: [neetcode150, striver]
tags: [dfs, recursion]
leetcode: diameter-of-binary-tree
function: diameterOfBinaryTree
params:
  - { name: root, type: TreeNode }
returns: number
hints:
  - Any path has a single highest node. Through that node, its length is the height of the left subtree plus the height of the right subtree.
  - Compute heights bottom-up and update a running maximum at every node, so you don't recompute heights.
complexity: { time: "O(n)", space: "O(h)" }
---

Given the `root` of a binary tree, return the length of its **diameter**: the longest path between any two nodes, measured in **edges**. The path does not have to go through the root.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `1 <= number of nodes <= 10^4`
- `-100 <= Node.val <= 100`
