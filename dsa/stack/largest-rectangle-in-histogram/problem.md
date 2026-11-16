---
title: Largest Rectangle in Histogram
difficulty: Hard
order: 11
lists: [neetcode150, striver]
tags: [monotonic-stack]
leetcode: largest-rectangle-in-histogram
function: largestRectangleArea
params:
  - { name: heights, type: "number[]" }
returns: number
hints:
  - The best rectangle is limited by its shortest bar. For each bar as the shortest, how wide can the rectangle stretch?
  - It stretches until the nearest strictly shorter bar on each side.
  - An increasing stack of indices finds both boundaries — a bar's right boundary is the bar that pops it, its left boundary is the bar below it on the stack.
complexity: { time: "O(n)", space: "O(n)" }
---

`heights` describes a histogram: bar `i` has width `1` and height `heights[i]`, and the bars stand side by side with no gaps.

Return the area of the largest axis-aligned rectangle that fits entirely inside the histogram.

## Constraints

- `1 <= heights.length <= 10^5`
- `0 <= heights[i] <= 10^4`
