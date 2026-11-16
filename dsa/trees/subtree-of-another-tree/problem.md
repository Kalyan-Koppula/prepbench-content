---
title: Subtree of Another Tree
difficulty: Easy
order: 7
lists: [neetcode150]
tags: [dfs, recursion]
leetcode: subtree-of-another-tree
function: isSubtree
params:
  - { name: root, type: TreeNode }
  - { name: subRoot, type: TreeNode }
returns: boolean
hints:
  - A subtree means a node together with **all** of its descendants — not just a matching top part.
  - At each node of `root`, ask "is the tree starting here identical to `subRoot`?" using a same-tree check.
  - For a linear-time version, serialise both trees with explicit null markers and search for one string inside the other.
complexity: { time: "O(m · n)", space: "O(h)" }
---

You're given two non-empty binary trees, `root` and `subRoot`. Return `true` if some node of `root`, taken together with **all** of its descendants, forms a tree identical to `subRoot` (same shape and values). `root` itself counts as one of its own subtrees.

Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `1 <= number of nodes in root <= 2000`
- `1 <= number of nodes in subRoot <= 1000`
- `-10^4 <= Node.val <= 10^4`

**Follow-up:** can you get the time down to `O(m + n)`?
