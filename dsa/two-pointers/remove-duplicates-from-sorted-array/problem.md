---
title: Remove Duplicates from Sorted Array
difficulty: Easy
order: 7
lists: [striver]
tags: [two-pointers, in-place]
leetcode: remove-duplicates-from-sorted-array
function: removeDuplicates
params:
  - { name: nums, type: "number[]" }
returns: "number[]"
hints:
  - In a sorted array, a value is new exactly when it differs from the last value you kept.
  - Use a slow "write" index and a fast "read" index. Copy forward only the values that differ from `nums[write - 1]`.
complexity: { time: "O(n)", space: "O(1)" }
---

You're given an integer array `nums` sorted in non-decreasing order. Compact it **in place** so that, if it holds `k` distinct values, positions `0` to `k - 1` contain each distinct value exactly once, in their original (sorted) order. What remains after position `k - 1` doesn't matter.

Return that deduplicated prefix — that is, `nums.slice(0, k)` after compaction. Aim for `O(1)` extra space for the compaction itself.

(The classic version returns only `k`; returning the prefix lets the tests check its contents too.)

## Constraints

- `1 <= nums.length <= 3 * 10^4`
- `-100 <= nums[i] <= 100`
- `nums` is sorted in non-decreasing order.
