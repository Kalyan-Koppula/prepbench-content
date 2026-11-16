---
title: 0/1 Knapsack
difficulty: Medium
order: 7
lists: [striver]
tags: [dp, knapsack]
function: knapsack
params:
  - { name: weights, type: "number[]" }
  - { name: values, type: "number[]" }
  - { name: capacity, type: number }
returns: number
hints:
  - For each item there are two choices — leave it, or take it if it still fits.
  - "`best[i][w]` = most value from the first `i` items within weight `w`."
  - In a single array, sweep the weight from `capacity` down to the item's weight so the item is taken at most once.
complexity: { time: "O(n · capacity)", space: "O(capacity)" }
---

There are `n` items; item `i` weighs `weights[i]` and is worth `values[i]`. You have a bag that holds a total weight of at most `capacity`.

Choose a set of items — each item **at most once**, no splitting — whose total weight fits in the bag, and return the largest total value possible.

## Constraints

- `1 <= n <= 100`, where `n = weights.length = values.length`
- `1 <= weights[i] <= 1000`
- `0 <= values[i] <= 1000`
- `0 <= capacity <= 1000`
