---
title: Merge Sorted Array
difficulty: Easy
order: 6
lists: [striver]
tags: [two-pointers, in-place]
leetcode: merge-sorted-array
function: merge
params:
  - { name: nums1, type: "number[]" }
  - { name: m, type: number }
  - { name: nums2, type: "number[]" }
  - { name: n, type: number }
returns: void
mutates: 0
hints:
  - Merging from the front overwrites values of `nums1` you haven't placed yet. Where is there free space?
  - Fill `nums1` from the back, placing the larger of the two current tails each time.
complexity: { time: "O(m + n)", space: "O(1)" }
---

You're given two integer arrays sorted in non-decreasing order: `nums1`, whose first `m` entries are real values, and `nums2` with `n` values. `nums1` has length `m + n`; its last `n` slots are placeholders (`0`) with room for `nums2`.

Merge `nums2` into `nums1` **in place** so that `nums1` holds all `m + n` values in non-decreasing order. Your function returns nothing; `nums1` is checked after the call.

## Constraints

- `nums1.length == m + n`, `nums2.length == n`
- `0 <= m, n <= 200`, `1 <= m + n <= 200`
- `-10^9 <= nums1[i], nums2[j] <= 10^9`

**Follow-up:** can you do it in `O(m + n)` time without allocating a second array?
