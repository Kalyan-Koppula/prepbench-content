---
title: Flatten Binary Tree to Linked List
difficulty: Medium
order: 16
lists: [striver]
tags: [dfs, pointers, morris]
leetcode: flatten-binary-tree-to-linked-list
function: flatten
params:
  - { name: root, type: TreeNode }
mutates: 0
hints:
  - The final chain follows preorder — node, then its left subtree, then its right subtree.
  - "For a node with a left child: the last node of the left subtree in preorder is its rightmost node. Hang the original right subtree there, then move the left subtree to the right."
complexity: { time: "O(n)", space: "O(1)" }
---

Given the `root` of a binary tree, rearrange it **in place** into a "linked list" made of the same nodes: every node's `left` pointer becomes `null`, its `right` pointer leads to the next node, and the nodes appear in **preorder** (node, then left subtree, then right subtree).

Your function returns nothing; the tree reachable from `root` afterwards is checked. Trees are written in level order with `null` for a missing child, so the flattened chain `1 -> 2 -> 3` appears as `[1,null,2,null,3]`.

## Constraints

- `0 <= number of nodes <= 2000`
- `-100 <= Node.val <= 100`

**Follow-up:** can you do it with `O(1)` extra space?
