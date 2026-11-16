---
title: Kth Largest Element in an Array
difficulty: Medium
order: 4
lists: [neetcode150, striver]
tags: [heap, top-k, quickselect]
leetcode: kth-largest-element-in-an-array
function: findKthLargest
params:
  - { name: nums, type: "number[]" }
  - { name: k, type: number }
returns: number
hints:
  - Sorting works in O(n log n). Can you avoid ordering the elements you don't care about?
  - A min-heap that never holds more than `k` values ends with the k-th largest on top.
  - For average linear time, partition like quicksort and recurse into only one side.
complexity: { time: "O(n log k)", space: "O(k)" }
---

Given an integer array `nums` and an integer `k`, return the value that would sit at position `k` if the array were sorted in **descending** order (1-indexed). Duplicates count as separate elements, so in `[3, 3, 1]` the 2nd largest is `3`.

## Constraints

- `1 <= k <= nums.length <= 10^5`
- `-10^4 <= nums[i] <= 10^4`

**Follow-up:** can you do it without sorting the whole array?
