---
title: Split Array Largest Sum
difficulty: Hard
order: 11
lists: [striver]
tags: [binary-search, binary-search-on-answer, greedy]
leetcode: split-array-largest-sum
function: splitArray
params:
  - { name: nums, type: "number[]" }
  - { name: k, type: number }
returns: number
hints:
  - Flip the question - given a limit `L`, what's the fewest pieces such that no piece sums above `L`?
  - That count only goes down as `L` grows. Binary search `L` between `max(nums)` and `sum(nums)`.
complexity: { time: "O(n log(sum))", space: "O(1)" }
---

Given an array of non-negative integers `nums` and an integer `k`, cut `nums` into exactly `k` non-empty **contiguous** pieces.

Among all ways to do this, return the smallest possible value of the largest piece sum.

## Constraints

- `1 <= nums.length <= 1000`
- `0 <= nums[i] <= 10^6`
- `1 <= k <= min(50, nums.length)`
