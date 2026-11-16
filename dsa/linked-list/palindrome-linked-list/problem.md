---
title: Palindrome Linked List
difficulty: Easy
order: 5
lists: [striver]
tags: [fast-slow-pointers, reversal]
leetcode: palindrome-linked-list
function: isPalindrome
params:
  - { name: head, type: ListNode }
returns: boolean
hints:
  - Copying the values into an array makes this a two-pointer check. Can you avoid the extra space?
  - Find the middle with fast/slow pointers, reverse the second half in place, then walk both halves together.
complexity: { time: "O(n)", space: "O(1)" }
---

Given the `head` of a non-empty singly linked list, return `true` if its values read the same forwards and backwards, and `false` otherwise.

Lists are shown as arrays: `[1,2,3]` is `1 -> 2 -> 3`.

## Constraints

- `1 <= number of nodes <= 10^5`
- `0 <= Node.val <= 9`

**Follow-up:** can you do it in `O(n)` time and `O(1)` extra space?
