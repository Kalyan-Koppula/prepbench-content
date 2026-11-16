---
title: Longest Consecutive Sequence
difficulty: Medium
order: 8
lists: [neetcode150, striver]
tags: [hash-set]
leetcode: longest-consecutive-sequence
function: longestConsecutive
params:
  - { name: nums, type: "number[]" }
returns: number
hints:
  - Sorting gives `O(n log n)`. To do better, think about membership checks instead of order.
  - Put everything in a set. A value `x` starts a run only if `x - 1` is absent — count upward only from those starts.
complexity: { time: "O(n)", space: "O(n)" }
---

Given an unsorted integer array `nums`, return the length of the longest run of consecutive integers `x, x + 1, x + 2, …` whose values all appear in `nums`. The values can be anywhere in the array, and duplicates count once.

Your algorithm should run in `O(n)` time.

## Constraints

- `0 <= nums.length <= 10^5`
- `-10^9 <= nums[i] <= 10^9`
