---
title: Merge Two Sorted Lists
difficulty: Easy
order: 2
lists: [neetcode150, striver]
tags: [pointers, dummy-node, merge]
leetcode: merge-two-sorted-lists
function: mergeTwoLists
params:
  - { name: list1, type: ListNode }
  - { name: list2, type: ListNode }
returns: ListNode
hints:
  - The smallest remaining value is always at the head of one of the two lists.
  - Start from a dummy node and keep appending whichever head is smaller. What do you do when one list runs out?
complexity: { time: "O(m + n)", space: "O(1)" }
---

You're given the heads of two linked lists, `list1` and `list2`, each sorted in non-decreasing order.

Splice their nodes together into one sorted list and return its head. Reuse the existing nodes rather than allocating new ones.

Lists are shown as arrays: `[1,2,3]` is `1 -> 2 -> 3`.

## Constraints

- `0 <= number of nodes in each list <= 5000`
- `-100 <= Node.val <= 100`
- Both lists are sorted in non-decreasing order.
