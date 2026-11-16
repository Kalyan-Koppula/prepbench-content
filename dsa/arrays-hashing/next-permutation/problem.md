---
title: Next Permutation
difficulty: Medium
order: 12
lists: [striver]
tags: [array, in-place]
leetcode: next-permutation
function: nextPermutation
params:
  - { name: nums, type: "number[]" }
returns: void
mutates: 0
hints:
  - Scan from the right. The longest non-increasing suffix is already at its largest arrangement — the change must happen just before it.
  - Swap that element with the smallest suffix value larger than it, then make the suffix as small as possible. The suffix is still non-increasing, so reversing it sorts it.
complexity: { time: "O(n)", space: "O(1)" }
---

Consider all orderings of the values in `nums`, sorted lexicographically (compare position by position, as you would words in a dictionary). Rearrange `nums` **in place** into the ordering that comes immediately after its current one.

If `nums` is already the last ordering (fully non-increasing), wrap around to the first one — ascending order.

Use only `O(1)` extra memory. Your function returns nothing; the array itself is checked after the call.

## Constraints

- `1 <= nums.length <= 100`
- `0 <= nums[i] <= 100`
