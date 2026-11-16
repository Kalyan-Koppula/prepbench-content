---
title: Remove Nth Node From End of List
difficulty: Medium
order: 6
lists: [neetcode150, striver]
tags: [two-pointers, dummy-node]
leetcode: remove-nth-node-from-end-of-list
function: removeNthFromEnd
params:
  - { name: head, type: ListNode }
  - { name: n, type: number }
returns: ListNode
hints:
  - To delete a node you need a pointer to the node **before** it. What if the node to delete is the head?
  - Start a second pointer `n` steps ahead of the first. When the leader reaches the end, where is the follower?
complexity: { time: "O(n)", space: "O(1)" }
---

Given the `head` of a linked list and an integer `n`, delete the `n`-th node counting from the end (`n = 1` is the last node) and return the head of the resulting list.

Lists are shown as arrays: `[1,2,3]` is `1 -> 2 -> 3`.

## Constraints

- `1 <= number of nodes <= 5000`
- `0 <= Node.val <= 100`
- `1 <= n <= number of nodes`

**Follow-up:** can you do it in a single pass?
