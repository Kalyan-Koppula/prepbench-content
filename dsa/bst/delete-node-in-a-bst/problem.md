---
title: Delete Node in a BST
difficulty: Medium
order: 6
lists: [striver]
tags: [bst, recursion]
leetcode: delete-node-in-a-bst
function: deleteNode
params:
  - { name: root, type: TreeNode }
  - { name: key, type: number }
returns: TreeNode
compare: checker
hints:
  - First find the node, using the BST ordering to pick a side at each step.
  - Removing a node with zero or one child is easy — its child (or nothing) takes its place.
  - With two children, something must fill the gap while keeping the order. The smallest value in the right subtree is a natural candidate.
complexity: { time: "O(h)", space: "O(h)" }
---

Given the `root` of a binary search tree with **distinct** values and an integer `key`, remove the node whose value is `key` (if there is one) and return the root of the resulting tree. If `key` is not in the tree, return the tree unchanged.

The result must still be a valid binary search tree containing exactly the original values minus `key`. Several trees can satisfy that — any of them is accepted.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `0 <= number of nodes <= 10^4`
- `-10^5 <= Node.val, key <= 10^5`, node values distinct
- `root` is a valid binary search tree.

**Follow-up:** can you do it in `O(h)` time?
