---
title: Non-overlapping Intervals
difficulty: Medium
order: 4
lists: [neetcode150]
tags: [intervals, greedy, sorting]
leetcode: non-overlapping-intervals
function: eraseOverlapIntervals
params:
  - { name: intervals, type: "number[][]" }
returns: number
hints:
  - Removing the fewest is the same as keeping the most. Which interval is the safest one to keep first?
  - Keep the interval that ends earliest — it leaves the most room for the rest. Sort by end and greedily keep compatible intervals.
complexity: { time: "O(n log n)", space: "O(1) extra (sorting aside)" }
---

`intervals[i] = [start, end]` describes a half-open range `[start, end)`, so ranges that only touch at an endpoint (like `[1, 2]` and `[2, 3]`) do **not** overlap.

Return the minimum number of ranges you must delete so that no two of the remaining ranges overlap.

## Constraints

- `1 <= intervals.length <= 10^5`
- `-5 * 10^4 <= start < end <= 5 * 10^4`
