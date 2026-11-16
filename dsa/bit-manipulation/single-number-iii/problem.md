---
title: Single Number III
difficulty: Medium
order: 6
lists: [striver]
tags: [bit-manipulation, xor]
leetcode: single-number-iii
function: singleNumber
params:
  - { name: nums, type: "number[]" }
returns: "number[]"
compare: unordered
hints:
  - XOR-ing everything gives `a ^ b` for the two unique values. Since `a !== b`, that result has at least one set bit.
  - "Pick any set bit of `a ^ b` (e.g. the lowest, `x & -x`). It splits the array into two groups, each containing exactly one unique value — XOR each group separately."
complexity: { time: "O(n)", space: "O(1)" }
---

In the integer array `nums`, exactly two distinct values appear once each and every other value appears exactly twice. Return the two values that appear once, in any order.

Use linear time and constant extra space.

## Constraints

- `2 <= nums.length <= 3 * 10^4`
- `-2^31 <= nums[i] <= 2^31 - 1`
- Exactly two values appear once; all others appear exactly twice.
