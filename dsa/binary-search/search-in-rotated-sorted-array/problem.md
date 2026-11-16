---
title: Search in Rotated Sorted Array
difficulty: Medium
order: 6
lists: [neetcode150, striver]
tags: [binary-search, rotated-array]
leetcode: search-in-rotated-sorted-array
function: search
params:
  - { name: nums, type: "number[]" }
  - { name: target, type: number }
returns: number
hints:
  - Split the array at `mid`. At least one of the two halves is fully sorted — which one can you tell from `nums[lo]` and `nums[mid]`?
  - In the sorted half, a simple range check tells you whether `target` can be there. If not, it must be in the other half.
complexity: { time: "O(log n)", space: "O(1)" }
---

An ascending array of **distinct** integers was rotated at some unknown pivot, so `[0,1,2,4,5,6]` might now read `[4,5,6,0,1,2]`. It may also be unrotated.

Given the rotated array `nums` and an integer `target`, return the index of `target`, or `-1` if it isn't present. Aim for `O(log n)`.

## Constraints

- `1 <= nums.length <= 5000`
- `-10^4 <= nums[i], target <= 10^4`
- All values are distinct; `nums` is a rotation of an ascending array.
