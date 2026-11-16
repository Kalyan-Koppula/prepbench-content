---
title: Majority Element II
difficulty: Medium
order: 10
lists: [striver]
tags: [boyer-moore, counting]
leetcode: majority-element-ii
function: majorityElement
params:
  - { name: nums, type: "number[]" }
returns: "number[]"
compare: unordered
hints:
  - How many distinct values can each occur more than `n / 3` times? That bounds the answer size.
  - Extend the voting idea with two candidates and two counters, then verify both with a second pass.
complexity: { time: "O(n)", space: "O(1)" }
---

Given an integer array `nums` of length `n`, return every distinct value that occurs **more than** `⌊n / 3⌋` times. Return them in any order; return an empty array if there are none.

## Constraints

- `1 <= nums.length <= 5 * 10^4`
- `-10^9 <= nums[i] <= 10^9`

**Follow-up:** can you do it in `O(n)` time and `O(1)` extra space?
