---
title: Find the Duplicate Number
difficulty: Medium
order: 9
lists: [neetcode150, striver]
tags: [fast-slow-pointers, floyd, cycle-detection]
leetcode: find-the-duplicate-number
function: findDuplicate
params:
  - { name: nums, type: "number[]" }
returns: number
hints:
  - Every value is a valid index. Think of each index `i` as a node whose `next` is `nums[i]`.
  - Starting from index `0`, following `next` must eventually loop. Which value do two different nodes point to?
  - Floyd's cycle detection finds the node where the loop begins — that node's index is the answer.
complexity: { time: "O(n)", space: "O(1)" }
---

You're given an array `nums` of `n + 1` integers where every value lies in the range `[1, n]`. By the pigeonhole principle at least one value repeats; here **exactly one** value repeats (it may appear more than twice).

Return the repeated value without modifying `nums` and using only `O(1)` extra space.

## Constraints

- `1 <= n <= 10^5`
- `nums.length === n + 1`
- `1 <= nums[i] <= n`
- Exactly one value appears more than once.

**Follow-up:** can you do it in linear time?
