---
title: Hand of Straights
difficulty: Medium
order: 5
lists: [neetcode150]
tags: [greedy, hash-map, sorting]
leetcode: hand-of-straights
function: isNStraightHand
params:
  - { name: hand, type: "number[]" }
  - { name: groupSize, type: number }
returns: boolean
hints:
  - The smallest card left in the hand has only one possible role. What is it?
  - "Count each value, then repeatedly take the smallest remaining value `v` and consume one each of `v, v + 1, ..., v + groupSize - 1`."
complexity: { time: "O(n log n)", space: "O(n)" }
---

You hold some cards, each showing an integer, given as the array `hand`. Decide whether the cards can be split into groups such that every group has exactly `groupSize` cards whose values are consecutive integers (for example `4, 5, 6`).

Every card must belong to exactly one group. Return `true` if such a split exists, otherwise `false`.

## Constraints

- `1 <= hand.length <= 10^4`
- `0 <= hand[i] <= 10^9`
- `1 <= groupSize <= hand.length`
