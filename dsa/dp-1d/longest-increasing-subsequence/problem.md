---
title: Longest Increasing Subsequence
difficulty: Medium
order: 9
lists: [neetcode150, striver]
tags: [dp, binary-search]
leetcode: longest-increasing-subsequence
function: lengthOfLIS
params:
  - { name: nums, type: "number[]" }
returns: number
hints:
  - "`len[i]` = length of the longest strictly increasing subsequence that ends with `nums[i]`."
  - "`len[i] = 1 + max(len[j])` over `j < i` with `nums[j] < nums[i]` — that's O(n²)."
  - For O(n log n), keep `tails[k]` = smallest possible last value of an increasing subsequence of length `k + 1`, and binary-search where each number goes.
complexity: { time: "O(n log n)", space: "O(n)" }
---

Given an integer array `nums`, return the length of its longest **strictly increasing** subsequence.

A subsequence keeps the original order but may skip any elements.

## Constraints

- `1 <= nums.length <= 2500`
- `-10^4 <= nums[i] <= 10^4`

**Follow-up:** can you get below O(n²)?
