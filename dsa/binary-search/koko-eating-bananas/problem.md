---
title: Koko Eating Bananas
difficulty: Medium
order: 4
lists: [neetcode150, striver]
tags: [binary-search, binary-search-on-answer]
leetcode: koko-eating-bananas
function: minEatingSpeed
params:
  - { name: piles, type: "number[]" }
  - { name: h, type: number }
returns: number
hints:
  - For a fixed speed `k`, how many hours does it take to finish every pile?
  - If speed `k` is fast enough, so is every speed above it. What range of speeds could the answer be in?
  - Binary search over speeds `1..max(piles)` for the first one that finishes within `h` hours.
complexity: { time: "O(n log(max(piles)))", space: "O(1)" }
---

Koko has `piles` of bananas, where `piles[i]` is the size of the `i`-th pile, and `h` hours before the guards come back.

She picks an integer eating speed `k` (bananas per hour). Every hour she chooses one pile and eats `k` bananas from it; if the pile has fewer than `k` left, she finishes it and waits out the rest of that hour without starting another pile.

Return the **smallest** `k` that lets her finish all the piles within `h` hours.

## Constraints

- `1 <= piles.length <= 10^4`
- `piles.length <= h <= 10^9`
- `1 <= piles[i] <= 10^9`
