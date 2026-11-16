---
title: Missing Number
difficulty: Easy
order: 5
lists: [neetcode150, striver]
tags: [bit-manipulation, xor, math]
leetcode: missing-number
function: missingNumber
params:
  - { name: nums, type: "number[]" }
returns: number
hints:
  - You know exactly which values *should* be present. Compare the expected collection with the actual one.
  - "XOR every index `0..n` with every element; each present value cancels with its matching index, leaving the missing one. (Or subtract the array's sum from `n(n+1)/2`.)"
complexity: { time: "O(n)", space: "O(1)" }
---

The array `nums` holds `n` **distinct** integers taken from the range `0` to `n` inclusive, so exactly one value from that range is absent. Return the absent value.

## Constraints

- `1 <= n === nums.length <= 10^4`
- `0 <= nums[i] <= n`
- All values in `nums` are distinct.

**Follow-up:** use `O(1)` extra space and `O(n)` time.
