---
title: Binary Tree Level Order Traversal
difficulty: Medium
order: 8
lists: [neetcode150, striver]
tags: [bfs, queue]
leetcode: binary-tree-level-order-traversal
function: levelOrder
params:
  - { name: root, type: TreeNode }
returns: "number[][]"
hints:
  - A queue visits nodes in order of distance from the root.
  - Before processing a level, note how many nodes the queue holds — exactly those nodes form the current level.
complexity: { time: "O(n)", space: "O(n)" }
---

Given the `root` of a binary tree, return its values grouped by depth: one array per level, top level first, and within each level from left to right. An empty tree gives `[]`.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `0 <= number of nodes <= 2000`
- `-1000 <= Node.val <= 1000`
