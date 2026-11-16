---
title: Balanced Binary Tree
difficulty: Easy
order: 6
lists: [neetcode150, striver]
tags: [dfs, recursion]
leetcode: balanced-binary-tree
function: isBalanced
params:
  - { name: root, type: TreeNode }
returns: boolean
hints:
  - Checking only the root is not enough — every node must satisfy the height rule.
  - Return each subtree's height bottom-up, and use a sentinel such as `-1` to mean "already unbalanced below here".
complexity: { time: "O(n)", space: "O(h)" }
---

Given the `root` of a binary tree, decide whether it is **height-balanced**: at *every* node, the heights of the left and right subtrees differ by at most `1`. An empty tree is balanced.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `0 <= number of nodes <= 5000`
- `-10^4 <= Node.val <= 10^4`
