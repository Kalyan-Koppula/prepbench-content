---
title: Two Sum
difficulty: Easy
order: 1
lists: [neetcode150, striver]
tags: [hash-map]
leetcode: two-sum
function: twoSum
params:
  - { name: nums, type: "number[]" }
  - { name: target, type: number }
returns: "number[]"
compare: unordered
hints:
  - For each number, which other value would complete the pair?
  - Remember values you have already passed, so you can check for the complement in O(1).
complexity: { time: "O(n)", space: "O(n)" }
---

You're given an integer array `nums` and an integer `target`. Exactly one pair of **different positions** `i` and `j` satisfies `nums[i] + nums[j] === target`.

Return those two indices. The order of the two indices does not matter.

## Constraints

- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i], target <= 10^9`
- Exactly one valid pair exists.
