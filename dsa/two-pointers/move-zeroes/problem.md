---
title: Move Zeroes
difficulty: Easy
order: 8
lists: [extra]
tags: [two-pointers, in-place]
leetcode: move-zeroes
function: moveZeroes
params:
  - { name: nums, type: "number[]" }
returns: void
mutates: 0
hints:
  - Think of it as "keep the non-zeros, in order" — the zeros just fill whatever is left.
  - A write pointer marks where the next non-zero goes. Swap each non-zero you read into that position.
complexity: { time: "O(n)", space: "O(1)" }
---

Given an integer array `nums`, move every `0` to the end **in place**, keeping the non-zero elements in their original relative order. Don't make a copy of the array.

Your function returns nothing; the array itself is checked after the call.

## Constraints

- `1 <= nums.length <= 10^4`
- `-2^31 <= nums[i] <= 2^31 - 1`

**Follow-up:** can you minimise the number of writes?
