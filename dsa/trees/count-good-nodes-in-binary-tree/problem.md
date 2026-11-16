---
title: Count Good Nodes in Binary Tree
difficulty: Medium
order: 11
lists: [neetcode150]
tags: [dfs, recursion]
leetcode: count-good-nodes-in-binary-tree
function: goodNodes
params:
  - { name: root, type: TreeNode }
returns: number
hints:
  - Whether a node is good depends only on the largest value between the root and it.
  - Pass the running maximum down as a parameter while you recurse.
complexity: { time: "O(n)", space: "O(h)" }
---

Given the `root` of a binary tree, call a node **good** if no node on the path from the root down to it (including the root) has a value strictly greater than its own. The root is always good.

Return the number of good nodes in the tree.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `1 <= number of nodes <= 10^4`
- `-10^4 <= Node.val <= 10^4`
