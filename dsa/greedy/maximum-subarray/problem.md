---
title: Maximum Subarray
difficulty: Medium
order: 1
lists: [neetcode150, striver]
tags: [kadane, greedy, dp]
leetcode: maximum-subarray
function: maxSubArray
params:
  - { name: nums, type: "number[]" }
returns: number
hints:
  - If the best subarray ending at the previous index has a negative sum, would you ever want to extend it?
  - "At each index choose between starting fresh at `nums[i]` or extending the run that ended at `i - 1`; track the best value seen."
complexity: { time: "O(n)", space: "O(1)" }
---

Given an integer array `nums`, find the contiguous, non-empty subarray with the largest sum and return that sum.

## Constraints

- `1 <= nums.length <= 10^5`
- `-10^4 <= nums[i] <= 10^4`

**Follow-up:** solve it in `O(n)`, then try a divide-and-conquer version.
