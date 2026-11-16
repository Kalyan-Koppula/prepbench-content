---
title: Binary Search
difficulty: Easy
order: 1
lists: [neetcode150, striver]
tags: [binary-search]
leetcode: binary-search
function: search
params:
  - { name: nums, type: "number[]" }
  - { name: target, type: number }
returns: number
hints:
  - The array is sorted, so comparing `target` with one element tells you which half can't contain it.
  - Keep a window `[lo, hi]`; look at the middle element and discard the half that's ruled out.
complexity: { time: "O(log n)", space: "O(1)" }
---

You're given an array `nums` of **distinct** integers sorted in ascending order, and an integer `target`.

Return the index of `target` in `nums`, or `-1` if it isn't there. Your algorithm must run in `O(log n)` time.

## Constraints

- `1 <= nums.length <= 10^4`
- `-10^4 <= nums[i], target <= 10^4`
- All values in `nums` are distinct and sorted ascending.
