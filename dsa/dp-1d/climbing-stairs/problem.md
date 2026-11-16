---
title: Climbing Stairs
difficulty: Easy
order: 1
lists: [neetcode150, striver]
tags: [dp, fibonacci]
leetcode: climbing-stairs
function: climbStairs
params:
  - { name: n, type: number }
returns: number
hints:
  - Think about the very last move you make to reach step `n`.
  - The number of ways to reach `n` is the ways to reach `n - 1` plus the ways to reach `n - 2`.
  - You only ever need the previous two counts.
complexity: { time: "O(n)", space: "O(1)" }
---

A staircase has `n` steps and you start at the bottom (step `0`). Each move climbs either **1** or **2** steps.

Return the number of distinct move sequences that land exactly on step `n`.

## Constraints

- `1 <= n <= 45`
