---
title: Perfect Squares
difficulty: Medium
order: 13
lists: [extra]
tags: [dp, unbounded-knapsack, bfs]
leetcode: perfect-squares
function: numSquares
params:
  - { name: n, type: number }
returns: number
hints:
  - This is Coin Change where the coins are `1, 4, 9, 16, …` up to `n`.
  - "`fewest[x] = 1 + min(fewest[x - k²])` over all `k² <= x`."
  - The answer is never more than 4.
complexity: { time: "O(n√n)", space: "O(n)" }
---

A perfect square is an integer of the form `k²` for some integer `k >= 1` (`1, 4, 9, 16, …`).

Given a positive integer `n`, return the smallest count of perfect squares (repeats allowed) that add up to exactly `n`.

## Constraints

- `1 <= n <= 10^4`
