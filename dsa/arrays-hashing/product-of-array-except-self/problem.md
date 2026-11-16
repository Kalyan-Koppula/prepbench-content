---
title: Product of Array Except Self
difficulty: Medium
order: 6
lists: [neetcode150]
tags: [prefix-product]
leetcode: product-of-array-except-self
function: productExceptSelf
params:
  - { name: nums, type: "number[]" }
returns: "number[]"
hints:
  - The answer at `i` is (product of everything left of `i`) × (product of everything right of `i`).
  - Fill the output with left products in one pass, then sweep from the right multiplying in a running right product.
complexity: { time: "O(n)", space: "O(1) extra" }
---

Given an integer array `nums`, return an array `answer` of the same length where `answer[i]` is the product of every element of `nums` except `nums[i]`.

Solve it in `O(n)` time **without using division**.

## Constraints

- `2 <= nums.length <= 10^5`
- `-30 <= nums[i] <= 30`
- Every prefix and suffix product fits in a 32-bit signed integer.

**Follow-up:** can you use only `O(1)` extra space (the output array doesn't count)?
