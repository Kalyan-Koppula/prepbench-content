---
title: Coin Change
difficulty: Medium
order: 6
lists: [neetcode150, striver]
tags: [dp, unbounded-knapsack]
leetcode: coin-change
function: coinChange
params:
  - { name: coins, type: "number[]" }
  - { name: amount, type: number }
returns: number
hints:
  - Greedy (largest coin first) fails — try coins `[1, 4, 6]` and amount `8`.
  - "`fewest[x]` = 1 + the minimum of `fewest[x - c]` over coins `c <= x`."
  - Use `Infinity` for unreachable amounts and convert to `-1` at the end.
complexity: { time: "O(amount · coins.length)", space: "O(amount)" }
---

You have coin denominations `coins`, with an unlimited supply of each, and a target `amount`.

Return the smallest number of coins whose values add up to exactly `amount`. If it can't be done, return `-1`. Making `0` takes zero coins.

## Constraints

- `1 <= coins.length <= 12`
- `1 <= coins[i] <= 2^31 - 1`
- `0 <= amount <= 10^4`
