---
title: All Nodes Distance K in Binary Tree
difficulty: Medium
order: 14
lists: [striver]
tags: [bfs, graph, parent-map]
leetcode: all-nodes-distance-k-in-binary-tree
function: distanceK
params:
  - { name: root, type: TreeNode }
  - { name: target, type: number }
  - { name: k, type: number }
returns: "number[]"
compare: unordered
hints:
  - Nodes at distance `k` can be below the target, or reached by going up first and then down a different branch.
  - Record each node's parent so you can move upward, then treat the tree as an undirected graph.
  - BFS outward from the target for exactly `k` steps, never revisiting a node.
complexity: { time: "O(n)", space: "O(n)" }
---

You're given the `root` of a binary tree with **distinct** values, a value `target` that appears in the tree, and an integer `k`.

Return the values of every node whose distance from the `target` node is exactly `k`, where distance is the number of edges on the path between two nodes (the path may go up through ancestors). Return them in any order; return `[]` if there are none.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `1 <= number of nodes <= 5000`
- `0 <= Node.val <= 10^4`, all values distinct
- `target` is a value in the tree
- `0 <= k <= 5000`
