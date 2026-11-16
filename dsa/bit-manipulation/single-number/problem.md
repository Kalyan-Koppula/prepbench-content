---
title: Single Number
difficulty: Easy
order: 1
lists: [neetcode150, striver]
tags: [bit-manipulation, xor]
leetcode: single-number
function: singleNumber
params:
  - { name: nums, type: "number[]" }
returns: number
hints:
  - What does XOR-ing a number with itself give?
  - "XOR is commutative and associative, so XOR-ing the whole array cancels every pair and leaves the lone value."
complexity: { time: "O(n)", space: "O(1)" }
---

In the integer array `nums`, every value occurs exactly twice except one value, which occurs once. Return that value.

Aim for linear time and constant extra space.

## Constraints

- `1 <= nums.length <= 3 * 10^4`
- `-3 * 10^4 <= nums[i] <= 3 * 10^4`
- Exactly one value appears once; all others appear exactly twice.
