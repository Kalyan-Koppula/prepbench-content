---
title: Reverse Linked List
difficulty: Easy
order: 1
lists: [neetcode150, striver]
tags: [pointers]
leetcode: reverse-linked-list
function: reverseList
params:
  - { name: head, type: ListNode }
returns: ListNode
hints:
  - Each node only needs its `next` pointer flipped to point backwards.
  - Track three pointers — previous, current, and the saved next.
complexity: { time: "O(n)", space: "O(1)" }
---

Given the `head` of a singly linked list, reverse the list in place and return the new head.

Lists are shown as arrays: `[1,2,3]` is `1 -> 2 -> 3`.

## Constraints

- `0 <= number of nodes <= 5000`
- `-5000 <= Node.val <= 5000`

**Follow-up:** can you do it both iteratively and recursively?
