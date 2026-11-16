---
title: Subsets II
difficulty: Medium
order: 2
lists: [neetcode150, striver]
tags: [backtracking, sorting]
leetcode: subsets-ii
function: subsetsWithDup
params:
  - { name: nums, type: "number[]" }
returns: "number[][]"
compare: unordered-nested
hints:
  - Two subsets are the same if they contain the same values with the same multiplicities. Sorting puts equal values side by side.
  - "In the start-index backtracking loop, skip `nums[i]` when it equals `nums[i - 1]` and `i > start` — picking either copy at the same level gives the same subtree."
complexity: { time: "O(n · 2^n)", space: "O(n)" }
---

Given an integer array `nums` that **may contain duplicates**, return every distinct subset (sub-multiset) of it.

Two subsets count as the same if they contain the same values the same number of times, regardless of which positions they came from. Return each distinct subset once, in any order, with elements in any order.

## Constraints

- `1 <= nums.length <= 10`
- `-10 <= nums[i] <= 10`
