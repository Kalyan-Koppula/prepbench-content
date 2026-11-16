---
title: Next Greater Element II
difficulty: Medium
order: 6
lists: [striver]
tags: [monotonic-stack, circular-array]
leetcode: next-greater-element-ii
function: nextGreaterElements
params:
  - { name: nums, type: "number[]" }
returns: "number[]"
hints:
  - Without the wrap-around this is the classic next-greater-element stack. How can you simulate wrapping?
  - Walk the indices twice (`i % n` for `i` from `0` to `2n - 1`), only pushing during the first lap.
complexity: { time: "O(n)", space: "O(n)" }
---

`nums` is a **circular** array: after the last element, the search continues from the first element.

For each element, find the first value strictly greater than it that you meet when moving forward (wrapping around if needed). Return an array of those values, using `-1` for elements that have no greater value anywhere in the array.

## Constraints

- `1 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
