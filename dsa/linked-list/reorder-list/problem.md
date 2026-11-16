---
title: Reorder List
difficulty: Medium
order: 7
lists: [neetcode150]
tags: [fast-slow-pointers, reversal, merge]
leetcode: reorder-list
function: reorderList
params:
  - { name: head, type: ListNode }
mutates: 0
hints:
  - The new order alternates between the front of the list and the back. The back half would be easy to consume if it were reversed.
  - Three steps you already know - find the middle, reverse the second half, interleave the two halves.
complexity: { time: "O(n)", space: "O(1)" }
---

You're given the `head` of a singly linked list `L0 -> L1 -> … -> Ln-1 -> Ln`. Rearrange its nodes in place into

`L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2 -> …`

Only the links may change — not the values. The function returns nothing; the list starting at `head` is checked after the call.

Lists are shown as arrays: `[1,2,3]` is `1 -> 2 -> 3`.

## Constraints

- `1 <= number of nodes <= 5 * 10^4`
- `1 <= Node.val <= 1000`
