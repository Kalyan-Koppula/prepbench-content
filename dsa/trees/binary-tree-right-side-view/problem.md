---
title: Binary Tree Right Side View
difficulty: Medium
order: 10
lists: [neetcode150, striver]
tags: [bfs, dfs]
leetcode: binary-tree-right-side-view
function: rightSideView
params:
  - { name: root, type: TreeNode }
returns: "number[]"
hints:
  - From the right you see exactly one node per level. Which one?
  - In a level-order traversal it's the last node of each level. In a DFS that visits right before left, it's the first node you reach at each new depth.
complexity: { time: "O(n)", space: "O(h)" }
---

Imagine standing to the right of a binary tree. Given its `root`, return the values of the nodes you can see, from the top level to the bottom — the rightmost node of each level. An empty tree gives `[]`.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `0 <= number of nodes <= 2000`
- `-100 <= Node.val <= 100`
