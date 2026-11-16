---
title: Insert into a Binary Search Tree
difficulty: Medium
order: 5
lists: [striver]
tags: [bst]
leetcode: insert-into-a-binary-search-tree
function: insertIntoBST
params:
  - { name: root, type: TreeNode }
  - { name: val, type: number }
returns: TreeNode
hints:
  - Search for `val` as if it were in the tree. Where does the search fall off?
  - That empty spot is exactly where the new leaf goes.
complexity: { time: "O(h)", space: "O(1)" }
---

Given the `root` of a binary search tree and a value `val` that is **not** already in the tree, insert `val` and return the root of the resulting tree.

Insert it the standard way, as a **new leaf**: starting at the root, go left when `val` is smaller than the current node and right when it is larger, and attach the new node at the first missing child you reach. Don't move or rebalance any existing node. If the tree is empty, the new node becomes the root.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `0 <= number of nodes <= 10^4`
- `-10^8 <= Node.val, val <= 10^8`, all values distinct
- `root` is a valid binary search tree and `val` is not in it.
