---
title: Boundary of Binary Tree
difficulty: Medium
order: 12
lists: [striver]
tags: [dfs, traversal]
leetcode: boundary-of-binary-tree
function: boundaryOfBinaryTree
params:
  - { name: root, type: TreeNode }
returns: "number[]"
hints:
  - Split the answer into four parts — root, left edge, leaves, right edge — and build each separately.
  - Exclude leaves from both edges so they're only added once, by the leaf pass.
  - The right edge is collected top-down but must be output bottom-up.
complexity: { time: "O(n)", space: "O(n)" }
---

Given the `root` of a binary tree, return the values on its **boundary**, walking anticlockwise from the root. The boundary is the concatenation of four parts, with no node listed twice:

1. **The root.**
2. **The left edge**: start at the root's left child. From each node on the edge, continue to its left child if it has one, otherwise its right child. Stop *before* reaching a leaf — leaves are not part of the edge. If the root has no left child, the left edge is empty.
3. **The leaves**: every leaf of the tree, from left to right (the order an ordinary left-before-right DFS meets them).
4. **The right edge**, defined the mirror way (start at the root's right child, prefer the right child, stop before a leaf), listed **from the bottom up**.

For this problem the root itself never counts as a leaf, so a single-node tree gives `[root.val]`.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `1 <= number of nodes <= 10^4`
- `-1000 <= Node.val <= 1000`
