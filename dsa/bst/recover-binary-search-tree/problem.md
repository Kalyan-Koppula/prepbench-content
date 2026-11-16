---
title: Recover Binary Search Tree
difficulty: Medium
order: 9
lists: [striver]
tags: [bst, inorder, morris]
leetcode: recover-binary-search-tree
function: recoverTree
params:
  - { name: root, type: TreeNode }
mutates: 0
hints:
  - In a valid BST the inorder sequence is strictly increasing. What does swapping two values do to that sequence?
  - Track the previous node during inorder. The first out-of-order pair gives the first wrong node; the last out-of-order pair gives the second.
  - If the swapped values are neighbours in sorted order, there's only one out-of-order pair — the two nodes are that pair.
complexity: { time: "O(n)", space: "O(h)" }
---

You're given the `root` of a binary search tree in which the values of **exactly two** nodes were swapped by mistake. Fix the tree **in place** by swapping those two values back, without changing its shape.

Your function returns nothing; the tree reachable from `root` afterwards is checked. Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `2 <= number of nodes <= 1000`
- `-2^31 <= Node.val <= 2^31 - 1`, all values distinct
- Swapping exactly two node values back makes the tree a valid binary search tree.

**Follow-up:** the inorder approach uses `O(h)` space. Can you do it with `O(1)` extra space?
