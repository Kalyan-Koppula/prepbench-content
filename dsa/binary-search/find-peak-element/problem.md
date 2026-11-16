---
title: Find Peak Element
difficulty: Medium
order: 3
lists: [striver]
tags: [binary-search]
leetcode: find-peak-element
function: findPeakElement
params:
  - { name: nums, type: "number[]" }
returns: number
compare: checker
hints:
  - Pick any index `i`. If `nums[i + 1]` is bigger, is a peak guaranteed to exist somewhere to the right?
  - Walking uphill must eventually stop, because the boundary counts as `-∞`. Use that to throw away half the array each step.
complexity: { time: "O(log n)", space: "O(1)" }
---

A **peak** is an element strictly greater than both of its neighbours. Treat the positions just outside the array as `-∞`, so the first and last elements only need to beat their single real neighbour.

Given an integer array `nums` in which no two adjacent elements are equal, return the index of **any** peak. Your algorithm must run in `O(log n)` time.

## Constraints

- `1 <= nums.length <= 1000`
- `-2^31 <= nums[i] <= 2^31 - 1`
- `nums[i] !== nums[i + 1]` for every valid `i`
