---
title: House Robber
difficulty: Medium
order: 3
lists: [neetcode150, striver]
tags: [dp]
hints:
  - At each house you either take it (and must have skipped the previous one) or skip it.
  - "`best(i) = max(best(i - 1), best(i - 2) + nums[i])`."
  - Two rolling variables are enough.
leetcode: house-robber
function: rob
params:
  - { name: nums, type: "number[]" }
returns: number
complexity: { time: "O(n)", space: "O(1)" }
---

Houses stand in a row and `nums[i]` is the cash in house `i`. Taking cash from two **adjacent** houses trips an alarm.

Return the largest total you can collect without ever taking from two neighbouring houses.

## Constraints

- `1 <= nums.length <= 100`
- `0 <= nums[i] <= 400`
