---
title: Sort List
difficulty: Medium
order: 11
lists: [striver]
tags: [merge-sort, fast-slow-pointers, divide-and-conquer]
leetcode: sort-list
function: sortList
params:
  - { name: head, type: ListNode }
returns: ListNode
hints:
  - Which `O(n log n)` sort needs no random access? Linked lists split and merge cheaply.
  - Split at the middle with fast/slow pointers, sort each half recursively, then merge the two sorted halves.
complexity: { time: "O(n log n)", space: "O(log n)" }
---

Given the `head` of a linked list, return the list sorted in ascending order. Rearrange the existing nodes; aim for `O(n log n)` time.

Lists are shown as arrays: `[1,2,3]` is `1 -> 2 -> 3`.

## Constraints

- `0 <= number of nodes <= 5 * 10^4`
- `-10^5 <= Node.val <= 10^5`

**Follow-up:** can you sort it using `O(1)` extra space?
