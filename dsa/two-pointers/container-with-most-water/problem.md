---
title: Container With Most Water
difficulty: Medium
order: 5
lists: [neetcode150]
tags: [two-pointers, greedy]
leetcode: container-with-most-water
function: maxArea
params:
  - { name: height, type: "number[]" }
returns: number
hints:
  - The water held by lines `i < j` is `(j - i) * min(height[i], height[j])`. Start with the widest pair.
  - Moving the taller line inward can never help — the width shrinks and the height is still capped by the shorter line. So always move the shorter one.
complexity: { time: "O(n)", space: "O(1)" }
---

You're given an array `height` where `height[i]` is the height of a vertical line standing at x-coordinate `i`. Choose two of the lines; together with the x-axis they form a container whose water level is limited by the shorter line.

Return the maximum amount of water such a container can hold — that is, the maximum over `i < j` of `(j - i) * min(height[i], height[j])`. Lines between the two chosen ones don't get in the way.

## Constraints

- `2 <= height.length <= 10^5`
- `0 <= height[i] <= 10^4`
