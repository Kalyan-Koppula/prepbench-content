---
title: Subarrays with K Different Integers
difficulty: Hard
order: 7
lists: [striver]
tags: [sliding-window, hash-map, at-most-trick]
leetcode: subarrays-with-k-different-integers
function: subarraysWithKDistinct
params:
  - { name: nums, type: "number[]" }
  - { name: k, type: number }
returns: number
hints:
  - Counting subarrays with *exactly* `k` distinct values is hard to slide directly. Counting *at most* `k` is easy — why?
  - For a valid window ending at `right`, every start from `left` to `right` also gives a valid subarray.
  - Exactly `k` distinct = (at most `k`) minus (at most `k - 1`).
complexity: { time: "O(n)", space: "O(n)" }
---

Given an integer array `nums` and an integer `k`, count the contiguous, non-empty subarrays of `nums` that contain **exactly `k`** distinct values.

## Constraints

- `1 <= nums.length <= 2 * 10^4`
- `1 <= nums[i] <= nums.length`
- `1 <= k <= nums.length`
