---
title: Median of Two Sorted Arrays
difficulty: Hard
order: 12
lists: [neetcode150, striver]
tags: [binary-search, partition]
leetcode: median-of-two-sorted-arrays
function: findMedianSortedArrays
params:
  - { name: nums1, type: "number[]" }
  - { name: nums2, type: "number[]" }
returns: number
compare: float
hints:
  - The median splits the combined values into a left half and a right half of equal size (left gets the extra one when the total is odd).
  - If you take `i` elements from `nums1` for the left half, the count from `nums2` is forced. What must be true at the cut for the split to be valid?
  - Binary search `i` over the shorter array, comparing the four values that border the cut.
complexity: { time: "O(log(min(m, n)))", space: "O(1)" }
---

You're given two arrays `nums1` and `nums2`, each sorted in ascending order, with lengths `m` and `n`. Return the median of all `m + n` values combined.

The median is the middle value of the combined sorted list, or the average of the two middle values when `m + n` is even. Answers within `10^-5` are accepted.

Aim for `O(log(m + n))` time.

## Constraints

- `0 <= m, n <= 1000`
- `1 <= m + n <= 2000`
- `-10^6 <= nums1[i], nums2[i] <= 10^6`
