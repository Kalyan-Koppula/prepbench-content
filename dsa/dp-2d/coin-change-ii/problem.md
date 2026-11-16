---
title: Coin Change II
difficulty: Medium
order: 5
lists: [neetcode150, striver]
tags: [dp, unbounded-knapsack, counting]
leetcode: coin-change-ii
function: change
params:
  - { name: amount, type: number }
  - { name: coins, type: "number[]" }
returns: number
hints:
  - "`2 + 1` and `1 + 2` are the same combination — fix an order in which coins are considered."
  - "`ways[i][x]` = combinations of `x` using only the first `i` coin types: either use none of coin `i`, or use at least one."
  - In one array, loop over coins on the outside and amounts (upward) on the inside.
complexity: { time: "O(amount · coins.length)", space: "O(amount)" }
---

You have an unlimited supply of coins of each denomination in `coins`. Return the number of different **combinations** of coins that add up to exactly `amount`.

Two combinations are the same if they use the same number of each coin, regardless of order. Making `0` has exactly one combination (use nothing).

## Constraints

- `1 <= coins.length <= 300`
- `1 <= coins[i] <= 5000`, all distinct
- `0 <= amount <= 5000`
- The answer fits in a 32-bit signed integer.
