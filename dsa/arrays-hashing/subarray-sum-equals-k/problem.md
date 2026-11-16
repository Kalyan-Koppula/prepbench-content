---
title: Subarray Sum Equals K
difficulty: Medium
order: 14
lists: [striver]
tags: [prefix-sum, hash-map]
leetcode: subarray-sum-equals-k
function: subarraySum
params:
  - { name: nums, type: "number[]" }
  - { name: k, type: number }
returns: number
hints:
  - The sum of `nums[i..j]` is `prefix[j + 1] - prefix[i]`. Rewrite "subarray sums to `k`" in terms of two prefix sums.
  - While scanning, count how many earlier prefix sums equal `current - k`. A map from prefix sum to count does this in O(1). Don't forget the empty prefix.
complexity: { time: "O(n)", space: "O(n)" }
---

Given an integer array `nums` (values may be negative) and an integer `k`, return how many **contiguous, non-empty** subarrays have elements summing to exactly `k`.

## Constraints

- `1 <= nums.length <= 2 * 10^4`
- `-1000 <= nums[i] <= 1000`
- `-10^7 <= k <= 10^7`
