---
title: Sum of Subarray Minimums
difficulty: Medium
order: 10
lists: [striver]
tags: [monotonic-stack, contribution]
leetcode: sum-of-subarray-minimums
function: sumSubarrayMins
params:
  - { name: arr, type: "number[]" }
returns: number
hints:
  - Flip the question — instead of finding each subarray's minimum, ask in how many subarrays is `arr[i]` the minimum?
  - That count is (choices of left end) × (choices of right end), bounded by the nearest smaller elements on each side.
  - With duplicates, make one side strict and the other non-strict so each subarray is credited to exactly one index.
complexity: { time: "O(n)", space: "O(n)" }
---

Given an integer array `arr`, consider every contiguous, non-empty subarray and take its minimum. Return the sum of all those minimums.

The result can be large, so return it **modulo `10^9 + 7`**.

## Constraints

- `1 <= arr.length <= 3 * 10^4`
- `1 <= arr[i] <= 3 * 10^4`
