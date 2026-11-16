---
title: Largest Divisible Subset
difficulty: Medium
order: 14
lists: [striver]
tags: [dp, sorting, lis]
leetcode: largest-divisible-subset
function: largestDivisibleSubset
params:
  - { name: nums, type: "number[]" }
returns: "number[]"
compare: checker
hints:
  - After sorting, a set where every pair divides is just a chain `a₁ | a₂ | … | aₖ` — each element divides the next.
  - That makes it a Longest Increasing Subsequence where "increasing" means "divisible by".
  - Store a parent index for each position so you can rebuild the chain.
complexity: { time: "O(n²)", space: "O(n)" }
---

You're given an array `nums` of **distinct** positive integers. Find a largest subset in which, for every pair of elements `a` and `b`, either `a % b === 0` or `b % a === 0`.

Return the subset's elements in any order. If several subsets have the maximum size, any one of them is accepted.

## Constraints

- `1 <= nums.length <= 1000`
- `1 <= nums[i] <= 2 * 10^9`
- All values in `nums` are distinct.
