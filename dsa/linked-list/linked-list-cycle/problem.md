---
title: Linked List Cycle
difficulty: Easy
order: 4
lists: [neetcode150, striver]
tags: [fast-slow-pointers, floyd]
leetcode: linked-list-cycle
function: hasCycle
params:
  - { name: head, type: CyclicList }
returns: boolean
hints:
  - Remembering every node you've visited in a `Set` works. Can you do it without extra memory?
  - Send two pointers at different speeds. If there's a loop, can the faster one ever escape it?
complexity: { time: "O(n)", space: "O(1)" }
---

Given the `head` of a singly linked list, return `true` if following `next` pointers ever revisits a node (the list contains a cycle), and `false` if you eventually reach `null`.

Test inputs are written as `[values, pos]`: `values` lists the nodes in order and the last node's `next` points back to the node at index `pos`, or to `null` when `pos` is `-1`. Your function only receives `head` — `pos` is not passed in.

## Constraints

- `0 <= number of nodes <= 10^4`
- `-10^5 <= Node.val <= 10^5`
- `pos` is `-1` or a valid index into `values`.

**Follow-up:** can you solve it using `O(1)` extra memory?
