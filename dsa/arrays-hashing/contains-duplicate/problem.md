---
title: Contains Duplicate
difficulty: Easy
order: 2
lists: [neetcode150]
tags: [hash-set]
leetcode: contains-duplicate
function: containsDuplicate
params:
  - { name: nums, type: "number[]" }
returns: boolean
hints:
  - What would you need to remember about the elements you have already walked past?
  - A set answers "seen this before?" in O(1); stop at the first repeat.
complexity: { time: "O(n)", space: "O(n)" }
---

Given an integer array `nums`, return `true` if some value occurs at two or more positions, and `false` if every element is distinct.

## Constraints

- `1 <= nums.length <= 10^5`
- `-10^9 <= nums[i] <= 10^9`
