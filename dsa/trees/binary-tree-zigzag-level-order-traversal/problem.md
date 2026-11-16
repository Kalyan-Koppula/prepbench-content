---
title: Binary Tree Zigzag Level Order Traversal
difficulty: Medium
order: 9
lists: [striver]
tags: [bfs, queue]
leetcode: binary-tree-zigzag-level-order-traversal
function: zigzagLevelOrder
params:
  - { name: root, type: TreeNode }
returns: "number[][]"
hints:
  - Start from a normal level-order traversal.
  - Only the order in which you *record* each level changes; the order you enqueue children can stay left-to-right.
complexity: { time: "O(n)", space: "O(n)" }
---

Given the `root` of a binary tree, return its values level by level, alternating direction: the top level is read left to right, the next one right to left, the one after that left to right again, and so on. An empty tree gives `[]`.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `0 <= number of nodes <= 2000`
- `-100 <= Node.val <= 100`
