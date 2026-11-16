---
title: Best Time to Buy and Sell Stock
difficulty: Easy
order: 1
lists: [neetcode150, striver]
tags: [sliding-window, running-min]
leetcode: best-time-to-buy-and-sell-stock
function: maxProfit
params:
  - { name: prices, type: "number[]" }
returns: number
hints:
  - The sell day must come after the buy day. If you fix the sell day, which buy day is best?
  - Track the cheapest price seen so far while scanning left to right.
complexity: { time: "O(n)", space: "O(1)" }
---

`prices[i]` is the price of one share on day `i`. You may make **one** trade: buy on some day, then sell on a strictly later day.

Return the largest profit you can make. If every possible trade loses money, don't trade and return `0`.

## Constraints

- `1 <= prices.length <= 10^5`
- `0 <= prices[i] <= 10^4`
