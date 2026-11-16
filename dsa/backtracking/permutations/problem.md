---
title: Permutations
difficulty: Medium
order: 5
lists: [neetcode150, striver]
tags: [backtracking]
leetcode: permutations
function: permute
params:
  - { name: nums, type: "number[]" }
returns: "number[][]"
compare: unordered
hints:
  - Build each permutation one position at a time. Which values are still allowed in the next position?
  - Track which elements are already in the path (a `used` array), or swap elements into place and recurse on the suffix.
complexity: { time: "O(n · n!)", space: "O(n)" }
---

Given an array `nums` of **distinct** integers, return every possible ordering (permutation) of its elements.

The permutations may be listed in any order, but each one is an ordered sequence — `[1, 2]` and `[2, 1]` are different permutations.

## Constraints

- `1 <= nums.length <= 6`
- `-10 <= nums[i] <= 10`
- All values in `nums` are distinct.
