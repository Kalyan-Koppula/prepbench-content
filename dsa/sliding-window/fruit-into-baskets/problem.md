---
title: Fruit Into Baskets
difficulty: Medium
order: 6
lists: [striver]
tags: [sliding-window, hash-map]
leetcode: fruit-into-baskets
function: totalFruit
params:
  - { name: fruits, type: "number[]" }
returns: number
hints:
  - Strip away the story — you want the longest contiguous stretch with at most two distinct values.
  - Keep a count per fruit type in the window; when a third type appears, shrink from the left until a type's count hits zero.
complexity: { time: "O(n)", space: "O(1)" }
---

A row of trees is described by `fruits`, where `fruits[i]` is the type of fruit on tree `i`. You carry **two baskets**, and each basket can hold any amount of a single fruit type.

You pick a starting tree, then walk right picking exactly one fruit from every tree, including the first. You must stop as soon as a tree's fruit fits in neither basket (or the row ends).

Return the maximum number of fruits you can collect.

## Constraints

- `1 <= fruits.length <= 10^5`
- `0 <= fruits[i] < fruits.length`
