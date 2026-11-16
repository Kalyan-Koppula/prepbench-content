---
title: Add Two Numbers
difficulty: Medium
order: 8
lists: [neetcode150, striver]
tags: [math, dummy-node]
leetcode: add-two-numbers
function: addTwoNumbers
params:
  - { name: l1, type: ListNode }
  - { name: l2, type: ListNode }
returns: ListNode
hints:
  - The digits are stored least-significant first — exactly the order you add numbers by hand.
  - Walk both lists together with a carry. Keep going while either list has nodes **or** the carry is non-zero.
complexity: { time: "O(max(m, n))", space: "O(1) extra (output not counted)" }
---

Two non-negative integers are stored as linked lists of digits in **reverse order**: the head holds the ones digit, the next node the tens digit, and so on. So `[4,2,1]` represents `124`.

Return their sum as a linked list in the same reversed format.

Neither number has leading zeros, except the number `0` itself, written `[0]`.

Lists are shown as arrays: `[1,2,3]` is `1 -> 2 -> 3`.

## Constraints

- `1 <= number of nodes in each list <= 100`
- `0 <= Node.val <= 9`
