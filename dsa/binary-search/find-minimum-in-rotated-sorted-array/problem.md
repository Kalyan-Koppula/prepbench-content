---
title: Find Minimum in Rotated Sorted Array
difficulty: Medium
order: 5
lists: [neetcode150, striver]
tags: [binary-search, rotated-array]
leetcode: find-minimum-in-rotated-sorted-array
function: findMin
params:
  - { name: nums, type: "number[]" }
returns: number
hints:
  - A rotated sorted array is two sorted runs; the minimum is where the second run starts.
  - Compare `nums[mid]` with `nums[hi]`. If it's bigger, the drop happens to the right of `mid`.
complexity: { time: "O(log n)", space: "O(1)" }
---

An ascending array of **distinct** integers has been rotated some number of times (possibly zero, possibly a full `n` times): rotating once moves the last element to the front, so `[1,2,3,4]` becomes `[4,1,2,3]`.

Given the rotated array `nums`, return its smallest element in `O(log n)` time.

## Constraints

- `1 <= nums.length <= 5000`
- `-5000 <= nums[i] <= 5000`
- All values are distinct; `nums` is a rotation of an ascending array.
