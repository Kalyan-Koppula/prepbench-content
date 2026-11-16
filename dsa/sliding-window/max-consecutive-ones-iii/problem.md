---
title: Max Consecutive Ones III
difficulty: Medium
order: 5
lists: [striver]
tags: [sliding-window]
leetcode: max-consecutive-ones-iii
function: longestOnes
params:
  - { name: nums, type: "number[]" }
  - { name: k, type: number }
returns: number
hints:
  - Rephrase it — find the longest subarray containing at most `k` zeros.
  - Grow the window to the right; while it holds more than `k` zeros, move the left edge.
complexity: { time: "O(n)", space: "O(1)" }
---

You're given a binary array `nums` and an integer `k`. You may flip **at most `k`** of the `0`s to `1`s.

Return the length of the longest run of consecutive `1`s you can end up with.

## Constraints

- `1 <= nums.length <= 10^5`
- `nums[i]` is `0` or `1`.
- `0 <= k <= nums.length`
