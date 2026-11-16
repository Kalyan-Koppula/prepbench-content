---
title: 4Sum
difficulty: Medium
order: 4
lists: [striver]
tags: [two-pointers, sorting]
leetcode: 4sum
function: fourSum
params:
  - { name: nums, type: "number[]" }
  - { name: target, type: number }
returns: "number[][]"
compare: unordered-nested
hints:
  - 3Sum is "fix one, then two-pointer". What does fixing two give you?
  - Sort, use two nested loops for the first two values, two pointers for the last two, and skip equal neighbours at every level.
complexity: { time: "O(n³)", space: "O(1) extra (ignoring sort and output)" }
---

Given an integer array `nums` and an integer `target`, return every **distinct** quadruplet of values `[a, b, c, d]` taken from four different positions such that `a + b + c + d === target`.

Quadruplets with the same values in a different order are the same — include each once. The order of the quadruplets and of the values inside each one doesn't matter.

## Constraints

- `1 <= nums.length <= 200`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`
