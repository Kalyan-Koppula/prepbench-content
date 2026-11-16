---
title: Subsets
difficulty: Medium
order: 1
lists: [neetcode150, striver]
tags: [backtracking, bit-manipulation]
leetcode: subsets
function: subsets
params:
  - { name: nums, type: "number[]" }
returns: "number[][]"
compare: unordered-nested
hints:
  - Every element is either in a subset or not — that's `2^n` subsets.
  - "Backtrack with a start index: at each call, record the current path, then try appending each later element."
complexity: { time: "O(n · 2^n)", space: "O(n)" }
---

Given an array `nums` of **distinct** integers, return every subset of it (its power set), including the empty set and `nums` itself.

Each subset must appear exactly once. Neither the order of the subsets nor the order of elements inside a subset matters.

## Constraints

- `1 <= nums.length <= 10`
- `-10 <= nums[i] <= 10`
- All values in `nums` are distinct.
