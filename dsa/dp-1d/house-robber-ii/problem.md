---
title: House Robber II
difficulty: Medium
order: 4
lists: [neetcode150, striver]
tags: [dp]
leetcode: house-robber-ii
function: rob
params:
  - { name: nums, type: "number[]" }
returns: number
hints:
  - The only new conflict compared with a straight row is between the first and the last house.
  - In any valid plan, at least one of house `0` and house `n - 1` is left alone.
  - Solve the straight-row problem on `nums[0..n-2]` and on `nums[1..n-1]` and take the better result.
complexity: { time: "O(n)", space: "O(1)" }
---

Houses are arranged in a **circle**: house `0` and house `n - 1` are neighbours, as are houses `i` and `i + 1`. `nums[i]` is the cash in house `i`, and you may not take cash from two neighbouring houses.

Return the largest total you can collect.

## Constraints

- `1 <= nums.length <= 100`
- `0 <= nums[i] <= 1000`
