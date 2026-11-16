---
title: Partition Equal Subset Sum
difficulty: Medium
order: 10
lists: [neetcode150, striver]
tags: [dp, knapsack, subset-sum]
leetcode: partition-equal-subset-sum
function: canPartition
params:
  - { name: nums, type: "number[]" }
returns: boolean
hints:
  - Two halves with equal sums means one subset sums to exactly `total / 2`.
  - An odd total is an instant `false`.
  - Keep a boolean array `reach[s]` for sums 0..target; for each number, update it from high sums to low so the number is used at most once.
complexity: { time: "O(n · total)", space: "O(total)" }
---

Given an array `nums` of positive integers, decide whether its elements can be divided into two groups (every element in exactly one group) whose sums are equal.

## Constraints

- `1 <= nums.length <= 200`
- `1 <= nums[i] <= 100`
