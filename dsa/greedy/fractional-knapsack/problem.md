---
title: Fractional Knapsack
difficulty: Medium
order: 10
lists: [striver]
tags: [greedy, sorting]
function: fractionalKnapsack
params:
  - { name: values, type: "number[]" }
  - { name: weights, type: "number[]" }
  - { name: capacity, type: number }
returns: number
compare: float
hints:
  - Since you can take part of an item, every unit of weight should carry as much value as possible.
  - "Sort items by `value / weight`, descending. Take whole items while they fit, then a fraction of the next one."
complexity: { time: "O(n log n)", space: "O(n)" }
---

You have `n` items; item `i` is worth `values[i]` and weighs `weights[i]`. Your bag holds at most `capacity` units of weight. Unlike the 0/1 knapsack, you may take **any fraction** of an item: taking a fraction `f` (`0 <= f <= 1`) of item `i` adds `f * values[i]` value and `f * weights[i]` weight.

Return the maximum total value that fits in the bag. Answers within `1e-5` relative error are accepted.

## Constraints

- `1 <= n <= 10^5`, `values.length === weights.length === n`
- `1 <= values[i], weights[i] <= 10^5`
- `1 <= capacity <= 10^9`
