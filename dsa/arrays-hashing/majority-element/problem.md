---
title: Majority Element
difficulty: Easy
order: 9
lists: [striver]
tags: [boyer-moore, counting]
leetcode: majority-element
function: majorityElement
params:
  - { name: nums, type: "number[]" }
returns: number
hints:
  - A hash map of counts works in `O(n)` space. Can you avoid the map?
  - Pair off each occurrence of the majority value against a different value. Something must be left over — keep a candidate and a counter.
complexity: { time: "O(n)", space: "O(1)" }
---

Given an integer array `nums` of length `n`, return the value that occurs **more than** `⌊n / 2⌋` times. Such a value is guaranteed to exist.

## Constraints

- `1 <= nums.length <= 5 * 10^4`
- `-10^9 <= nums[i] <= 10^9`
- A majority value always exists.

**Follow-up:** can you do it in `O(n)` time with `O(1)` extra space?
