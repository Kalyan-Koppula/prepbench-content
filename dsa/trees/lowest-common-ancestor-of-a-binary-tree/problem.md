---
title: Lowest Common Ancestor of a Binary Tree
difficulty: Medium
order: 13
lists: [striver]
tags: [dfs, recursion]
leetcode: lowest-common-ancestor-of-a-binary-tree
function: lowestCommonAncestor
params:
  - { name: root, type: TreeNode }
  - { name: p, type: number }
  - { name: q, type: number }
returns: number
hints:
  - Ask each subtree a yes/no question — "do you contain `p` or `q`?" — and return what you found.
  - If the left subtree reports one target and the right subtree reports the other, the current node is the answer. If only one side reports anything, pass that up.
complexity: { time: "O(n)", space: "O(h)" }
---

You're given the `root` of a binary tree whose node values are all **distinct**, and two different values `p` and `q` that both appear in the tree.

Return the value of their **lowest common ancestor**: the deepest node that has both the `p` node and the `q` node in its subtree. A node counts as part of its own subtree, so if one target is an ancestor of the other, it is the answer.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `2 <= number of nodes <= 10^4`
- `-10^5 <= Node.val <= 10^5`, all values distinct
- `p !== q`, and both are values in the tree
