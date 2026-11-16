---
title: Best Time to Buy and Sell Stock with Cooldown
difficulty: Medium
order: 8
lists: [neetcode150, striver]
tags: [dp, state-machine]
leetcode: best-time-to-buy-and-sell-stock-with-cooldown
function: maxProfit
params:
  - { name: prices, type: "number[]" }
returns: number
hints:
  - At the end of each day you are in one of three situations — holding a share, just sold today, or free with no share.
  - Write how each situation can be reached from the previous day's situations. Buying is only allowed from "free", not from "just sold".
  - Three running numbers are enough.
complexity: { time: "O(n)", space: "O(1)" }
---

`prices[i]` is the price of a stock on day `i`. You may complete as many buy-then-sell transactions as you like, subject to two rules:

- You hold at most one share at a time (sell before buying again).
- After selling, you must skip the **next** day entirely — no buying on the day right after a sale.

Return the maximum total profit. Doing nothing (profit `0`) is always allowed.

## Constraints

- `1 <= prices.length <= 5000`
- `0 <= prices[i] <= 1000`
