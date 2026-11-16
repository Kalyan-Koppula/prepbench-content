---
title: Same Tree
difficulty: Easy
order: 3
lists: [neetcode150, striver]
tags: [dfs, recursion]
leetcode: same-tree
function: isSameTree
params:
  - { name: p, type: TreeNode }
  - { name: q, type: TreeNode }
returns: boolean
hints:
  - Two trees match when their roots match and both pairs of subtrees match.
  - Handle the `null` cases first — both empty, or exactly one empty.
complexity: { time: "O(n)", space: "O(h)" }
---

You're given the roots `p` and `q` of two binary trees. Return `true` if they are identical — the same shape, with equal values at every corresponding node — and `false` otherwise.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `0 <= number of nodes in each tree <= 10^4`
- `-10^4 <= Node.val <= 10^4`
