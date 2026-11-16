---
title: Binary Tree Maximum Path Sum
difficulty: Hard
order: 18
lists: [neetcode150, striver]
tags: [dfs, recursion, dynamic-programming]
leetcode: binary-tree-maximum-path-sum
function: maxPathSum
params:
  - { name: root, type: TreeNode }
returns: number
hints:
  - Every path has one highest node where it may bend, taking at most one downward branch on each side.
  - For each node, compute the best sum of a path that starts at it and goes straight down. A negative branch is better dropped than taken.
  - At each node, combine `node.val` with the best non-negative downward sums from both sides to update a global answer, but return only one side to the parent.
complexity: { time: "O(n)", space: "O(h)" }
---

A **path** in a binary tree is a sequence of nodes where each consecutive pair is joined by an edge, and no node appears more than once. A path has at least one node and need not pass through the root.

Given the `root` of a binary tree, return the largest possible sum of node values along any path.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `1 <= number of nodes <= 3 * 10^4`
- `-1000 <= Node.val <= 1000`
