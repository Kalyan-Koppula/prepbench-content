---
title: Kth Smallest Element in a BST
difficulty: Medium
order: 3
lists: [neetcode150, striver]
tags: [bst, inorder, stack]
leetcode: kth-smallest-element-in-a-bst
function: kthSmallest
params:
  - { name: root, type: TreeNode }
  - { name: k, type: number }
returns: number
hints:
  - Which traversal visits a BST's values in sorted order?
  - Run it iteratively and stop as soon as you've visited `k` nodes.
complexity: { time: "O(h + k)", space: "O(h)" }
---

Given the `root` of a binary search tree and an integer `k`, return the `k`-th smallest value in the tree (`k` is 1-indexed, so `k = 1` asks for the minimum).

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `1 <= k <= number of nodes <= 10^4`
- `0 <= Node.val <= 10^4`, all values distinct
- `root` is a valid binary search tree.

**Follow-up:** if the tree is modified often (inserts and deletes) and you're asked for the `k`-th smallest repeatedly, how would you make each query fast?
