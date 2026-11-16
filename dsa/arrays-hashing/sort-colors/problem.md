---
title: Sort Colors
difficulty: Medium
order: 11
lists: [striver]
tags: [dutch-national-flag, two-pointers, in-place]
leetcode: sort-colors
function: sortColors
params:
  - { name: nums, type: "number[]" }
returns: void
mutates: 0
hints:
  - Counting each value and rewriting the array takes two passes. Can you do it in one?
  - Keep three regions — `0`s at the front, `2`s at the back, unknown in the middle — and shrink the unknown region one element at a time.
complexity: { time: "O(n)", space: "O(1)" }
---

You're given an array `nums` whose elements are each `0`, `1` or `2` (think red, white, blue). Rearrange it **in place** so that all `0`s come first, then all `1`s, then all `2`s.

Don't use a library sort. Your function returns nothing; the array itself is checked after the call.

## Constraints

- `1 <= nums.length <= 300`
- `nums[i]` is `0`, `1` or `2`

**Follow-up:** can you do it in a single pass with `O(1)` extra space?
