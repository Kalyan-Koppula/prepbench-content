---
title: 3Sum
difficulty: Medium
order: 3
lists: [neetcode150, striver]
tags: [two-pointers, sorting]
leetcode: 3sum
function: threeSum
params:
  - { name: nums, type: "number[]" }
returns: "number[][]"
compare: unordered-nested
hints:
  - Fix one element and you're left with a two-sum problem for the rest.
  - Sort first. Then for each fixed `nums[i]`, run two pointers on the part to its right, and skip equal neighbours so each triplet is produced once.
complexity: { time: "O(n²)", space: "O(1) extra (ignoring sort and output)" }
---

Given an integer array `nums`, return every **distinct** triplet of values `[a, b, c]` taken from three different positions such that `a + b + c === 0`.

Two triplets are the same if they contain the same values, regardless of order — include each such triplet once. The order of the triplets and of the values inside each triplet doesn't matter.

## Constraints

- `3 <= nums.length <= 3000`
- `-10^5 <= nums[i] <= 10^5`
