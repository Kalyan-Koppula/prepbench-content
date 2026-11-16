---
title: Last Stone Weight
difficulty: Easy
order: 2
lists: [neetcode150]
tags: [heap, simulation]
leetcode: last-stone-weight
function: lastStoneWeight
params:
  - { name: stones, type: "number[]" }
returns: number
hints:
  - Each round needs the two heaviest stones, and the leftover goes back into the pile.
  - A max-heap gives you the two largest in O(log n) each and accepts the remainder just as cheaply.
complexity: { time: "O(n log n)", space: "O(n)" }
---

You have a pile of stones with positive integer weights `stones`. Repeat the following while at least two stones remain:

- Take the two heaviest stones, with weights `x <= y`.
- If `x === y`, both are destroyed. Otherwise the lighter one is destroyed and the heavier one's weight becomes `y - x`; it goes back into the pile.

Return the weight of the stone left at the end, or `0` if none remain.

## Constraints

- `1 <= stones.length <= 1000`
- `1 <= stones[i] <= 1000`
