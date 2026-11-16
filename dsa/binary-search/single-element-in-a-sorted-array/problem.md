---
title: Single Element in a Sorted Array
difficulty: Medium
order: 7
lists: [striver]
tags: [binary-search]
leetcode: single-element-in-a-sorted-array
function: singleNonDuplicate
params:
  - { name: nums, type: "number[]" }
returns: number
hints:
  - Before the lone element, each pair starts at an even index. What happens to that pattern after it?
  - Look at an even index `mid`. If `nums[mid] === nums[mid + 1]`, the pattern is still intact up to here.
complexity: { time: "O(log n)", space: "O(1)" }
---

You're given a sorted integer array `nums` in which every value appears exactly **twice**, except for one value that appears exactly once.

Return the value that appears once. Your solution must run in `O(log n)` time and `O(1)` extra space.

## Constraints

- `1 <= nums.length <= 10^5` (`nums.length` is odd)
- `0 <= nums[i] <= 10^5`
- `nums` is sorted ascending; exactly one value occurs once and every other value occurs twice.
