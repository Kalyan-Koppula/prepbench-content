---
title: Aggressive Cows
difficulty: Hard
order: 10
lists: [striver]
tags: [binary-search, binary-search-on-answer, greedy]
function: aggressiveCows
params:
  - { name: stalls, type: "number[]" }
  - { name: k, type: number }
returns: number
hints:
  - Fix a minimum gap `d`. Sort the stalls — can you check greedily whether `k` cows fit with every pair at least `d` apart?
  - If gap `d` is achievable, every smaller gap is too. Search for the largest achievable `d`.
complexity: { time: "O(n log n + n log(range))", space: "O(1) beyond sorting" }
---

A barn has stalls at the integer positions listed in `stalls` (in no particular order). You must put `k` cows into `k` different stalls, and cows fight when they're close together, so you want them spread out.

Return the **largest** possible value of the smallest distance between any two of the placed cows.

## Constraints

- `2 <= stalls.length <= 10^5`
- `0 <= stalls[i] <= 10^9`; all positions are distinct.
- `2 <= k <= stalls.length`
