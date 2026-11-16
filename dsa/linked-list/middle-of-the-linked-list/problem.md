---
title: Middle of the Linked List
difficulty: Easy
order: 3
lists: [striver]
tags: [fast-slow-pointers]
leetcode: middle-of-the-linked-list
function: middleNode
params:
  - { name: head, type: ListNode }
returns: ListNode
hints:
  - Counting the nodes first and then walking half way works. Can you do it in a single pass?
  - Move one pointer one step and another two steps at a time. Where is the slow one when the fast one runs out?
complexity: { time: "O(n)", space: "O(1)" }
---

Given the `head` of a non-empty singly linked list, return the middle node. If the list has an even number of nodes there are two middle nodes — return the **second** one.

The output is the list starting at the returned node, so returning the middle of `[1,2,3]` shows as `[2,3]`.

Lists are shown as arrays: `[1,2,3]` is `1 -> 2 -> 3`.

## Constraints

- `1 <= number of nodes <= 5000`
- `-10^5 <= Node.val <= 10^5`
