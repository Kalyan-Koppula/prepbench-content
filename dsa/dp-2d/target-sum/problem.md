---
title: Target Sum
difficulty: Medium
order: 6
lists: [neetcode150, striver]
tags: [dp, knapsack, subset-sum]
leetcode: target-sum
function: findTargetSumWays
params:
  - { name: nums, type: "number[]" }
  - { name: target, type: number }
returns: number
hints:
  - Let `P` be the numbers given `+` and `N` those given `-`. Then `sum(P) - sum(N) = target` and `sum(P) + sum(N) = total`.
  - So `sum(P) = (total + target) / 2` — count subsets with that sum.
  - If `total + target` is odd or negative, the answer is `0`. Zeros double the count, which the subset DP handles naturally.
complexity: { time: "O(n · total)", space: "O(total)" }
---

You're given an array `nums` of non-negative integers and an integer `target`. Put a `+` or a `-` sign in front of **every** element, then add them all up.

Return how many sign assignments produce exactly `target`. Assignments differ if any position gets a different sign — even when the numbers there are equal (or zero).

## Constraints

- `1 <= nums.length <= 20`
- `0 <= nums[i] <= 1000`
- `0 <= sum(nums) <= 1000`
- `-1000 <= target <= 1000`
