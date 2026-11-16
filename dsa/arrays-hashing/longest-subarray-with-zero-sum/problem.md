---
title: Longest Subarray with Zero Sum
difficulty: Medium
order: 15
lists: [striver]
tags: [prefix-sum, hash-map]
function: longestZeroSumSubarray
params:
  - { name: nums, type: "number[]" }
returns: number
hints:
  - A subarray sums to zero exactly when the prefix sums at its two ends are equal.
  - For each prefix sum, remember the **first** index where it appeared; the longest zero-sum subarray ending here starts right after that index.
complexity: { time: "O(n)", space: "O(n)" }
---

Given an integer array `nums` (values may be negative), return the length of the longest **contiguous** subarray whose elements sum to `0`. Return `0` if no such subarray exists.

## Constraints

- `1 <= nums.length <= 10^5`
- `-1000 <= nums[i] <= 1000`
