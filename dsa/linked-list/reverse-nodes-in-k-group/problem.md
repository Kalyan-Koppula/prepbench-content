---
title: Reverse Nodes in k-Group
difficulty: Hard
order: 13
lists: [neetcode150, striver]
tags: [reversal, dummy-node]
leetcode: reverse-nodes-in-k-group
function: reverseKGroup
params:
  - { name: head, type: ListNode }
  - { name: k, type: number }
returns: ListNode
hints:
  - Before reversing a group, check that `k` nodes are actually left — the tail group stays as is if it's short.
  - For each group you need the node before it and the node after it. Reverse the group, then stitch it back between those two.
complexity: { time: "O(n)", space: "O(1)" }
---

Given the `head` of a linked list and a positive integer `k`, reverse the nodes of the list `k` at a time and return the new head.

Walk the list in consecutive blocks of `k` nodes and reverse each full block. If the last block has fewer than `k` nodes, leave it in its original order. Rewire the nodes; don't just swap values.

Lists are shown as arrays: `[1,2,3]` is `1 -> 2 -> 3`.

## Constraints

- `1 <= number of nodes <= 5000`
- `1 <= k <= 5000` (`k` may exceed the list length)
- `0 <= Node.val <= 1000`

**Follow-up:** can you do it with `O(1)` extra memory?
