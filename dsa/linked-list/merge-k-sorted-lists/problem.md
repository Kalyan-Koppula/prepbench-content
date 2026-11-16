---
title: Merge k Sorted Lists
difficulty: Hard
order: 12
lists: [neetcode150, striver]
tags: [heap, divide-and-conquer, merge]
leetcode: merge-k-sorted-lists
function: mergeKLists
params:
  - { name: lists, type: "ListNode[]" }
returns: ListNode
hints:
  - The next node of the output is the smallest of the `k` current heads. How do you find the minimum of `k` things quickly and repeatedly?
  - Keep the heads in a min-heap keyed by value. Pop the smallest, append it, push its successor.
  - Alternatively, merge lists in pairs, halving the number of lists each round.
complexity: { time: "O(N log k)", space: "O(k)" }
---

You're given an array `lists` of `k` linked lists, each sorted in ascending order. Merge them all into one sorted linked list and return its head.

Lists are shown as arrays: `[1,2,3]` is `1 -> 2 -> 3`, so the input `[[1,4],[2,3]]` holds two lists.

## Constraints

- `0 <= k <= 10^4`
- `0 <= lists[i].length <= 500`
- The total number of nodes `N` is at most `10^4`.
- `-10^4 <= Node.val <= 10^4`
- Each `lists[i]` is sorted ascending.
