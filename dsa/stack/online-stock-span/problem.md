---
title: Online Stock Span
difficulty: Medium
order: 7
lists: [striver]
tags: [monotonic-stack, design]
leetcode: online-stock-span
kind: class
class: StockSpanner
params: []
methods:
  - name: next
    params: [{ name: price, type: number }]
    returns: number
hints:
  - When today's price is at least yesterday's, today's span swallows yesterday's whole span.
  - Keep a stack of `[price, span]` pairs with strictly decreasing prices; merge spans as you pop.
complexity: { time: "O(1) amortised per call", space: "O(n)" }
---

Prices of a stock arrive one day at a time. For each new price, report its **span**: the number of consecutive days, ending with today and counting backwards, on which the price was less than or equal to today's price.

Implement `StockSpanner`:

- `next(price)` records today's `price` and returns today's span.

Tests are a sequence of operations: the first creates the object, and the output lists each call's return value (`null` for the constructor and methods that return nothing).

## Constraints

- `1 <= price <= 10^5`
- At most `10^4` calls to `next`.
