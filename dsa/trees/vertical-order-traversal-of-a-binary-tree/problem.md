---
title: Vertical Order Traversal of a Binary Tree
difficulty: Hard
order: 17
lists: [striver]
tags: [dfs, bfs, sorting, hash-map]
leetcode: vertical-order-traversal-of-a-binary-tree
function: verticalTraversal
params:
  - { name: root, type: TreeNode }
returns: "number[][]"
hints:
  - Give every node coordinates — a row (depth) and a column (left child is one column to the left, right child one to the right).
  - Collect `(column, row, value)` for every node; sorting those triples settles every ordering rule at once.
complexity: { time: "O(n log n)", space: "O(n)" }
---

Place the `root` of a binary tree at row `0`, column `0`. A node at `(row, col)` has its left child at `(row + 1, col - 1)` and its right child at `(row + 1, col + 1)`.

Return the node values grouped by column, from the leftmost column to the rightmost. Within one column, list values from the top row down; when several nodes share both the same row **and** the same column, list them in ascending order of value.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `1 <= number of nodes <= 1000`
- `0 <= Node.val <= 1000`
