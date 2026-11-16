---
title: Min Cost Climbing Stairs
difficulty: Easy
order: 2
lists: [neetcode150]
tags: [dp]
leetcode: min-cost-climbing-stairs
function: minCostClimbingStairs
params:
  - { name: cost, type: "number[]" }
returns: number
hints:
  - Let `dp[i]` be the cheapest way to *stand* on step `i` before paying its fee.
  - You arrive at step `i` from `i - 1` or `i - 2`, paying that step's fee.
  - The top is position `cost.length`; only the last two values are needed.
complexity: { time: "O(n)", space: "O(1)" }
---

Step `i` of a staircase has a fee `cost[i]`. Standing on a step, you may pay its fee and then climb either **1** or **2** steps. You may begin on step `0` or step `1` for free.

The top of the staircase is just past the last step (position `cost.length`). Return the minimum total fee to reach the top.

## Constraints

- `2 <= cost.length <= 1000`
- `0 <= cost[i] <= 999`
