---
title: Maximum Depth of Binary Tree
difficulty: Easy
order: 2
lists: [neetcode150, striver]
tags: [dfs, bfs, recursion]
leetcode: maximum-depth-of-binary-tree
function: maxDepth
params:
  - { name: root, type: TreeNode }
returns: number
hints:
  - The depth of a tree is one more than the depth of its deeper subtree.
  - An empty tree has depth `0`.
complexity: { time: "O(n)", space: "O(h)" }
---

Given the `root` of a binary tree, return its depth: the number of **nodes** on the longest path from the root down to any leaf. An empty tree has depth `0`.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `0 <= number of nodes <= 10^4`
- `-100 <= Node.val <= 100`
