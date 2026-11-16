---
title: Two Sum IV - Input is a BST
difficulty: Easy
order: 1
lists: [striver]
tags: [bst, inorder, two-pointers]
leetcode: two-sum-iv-input-is-a-bst
function: findTarget
params:
  - { name: root, type: TreeNode }
  - { name: k, type: number }
returns: boolean
hints:
  - An inorder traversal of a BST lists its values in ascending order.
  - On a sorted list, two pointers from both ends find a pair with a given sum in one pass.
  - For less memory, run one ascending and one descending iterator (each a stack) over the tree.
complexity: { time: "O(n)", space: "O(n)" }
---

Given the `root` of a binary search tree and an integer `k`, return `true` if two **different** nodes in the tree have values that add up to `k`, otherwise `false`.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `1 <= number of nodes <= 10^4`
- `-10^4 <= Node.val <= 10^4`, all values distinct
- `root` is a valid binary search tree.
- `-10^5 <= k <= 10^5`

**Follow-up:** can you use only `O(h)` extra space?
