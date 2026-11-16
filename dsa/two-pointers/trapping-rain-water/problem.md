---
title: Trapping Rain Water
difficulty: Hard
order: 9
lists: [neetcode150, striver]
tags: [two-pointers, prefix-max]
leetcode: trapping-rain-water
function: trap
params:
  - { name: height, type: "number[]" }
returns: number
hints:
  - The water above bar `i` is `min(tallest bar to its left, tallest bar to its right) - height[i]`, if positive.
  - Precomputing left and right maxima gives `O(n)` space. With pointers at both ends, the side with the smaller running max already knows its water level.
complexity: { time: "O(n)", space: "O(1)" }
---

You're given an array `height` describing an elevation profile: bar `i` has width `1` and height `height[i]`, and the bars stand side by side. After it rains, water settles in the dips between taller bars.

Return the total number of unit squares of water that remain trapped.

## Constraints

- `1 <= height.length <= 2 * 10^4`
- `0 <= height[i] <= 10^5`
