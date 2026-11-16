---
title: Maximum Product Subarray
difficulty: Medium
order: 7
lists: [neetcode150, striver]
tags: [dp, kadane]
leetcode: maximum-product-subarray
function: maxProduct
params:
  - { name: nums, type: "number[]" }
returns: number
hints:
  - A negative number turns the smallest product so far into the largest one.
  - For each position track both the maximum and the minimum product of a subarray ending there.
  - A zero resets both; the new element alone is always a candidate.
complexity: { time: "O(n)", space: "O(1)" }
---

Given an integer array `nums`, find the non-empty **contiguous** subarray whose elements have the largest product, and return that product.

## Constraints

- `1 <= nums.length <= 2 * 10^4`
- `-10 <= nums[i] <= 10`
- The product of every subarray fits in a 32-bit signed integer.
