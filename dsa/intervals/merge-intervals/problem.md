---
title: Merge Intervals
difficulty: Medium
order: 2
lists: [neetcode150, striver]
tags: [intervals, sorting]
leetcode: merge-intervals
function: merge
params:
  - { name: intervals, type: "number[][]" }
returns: "number[][]"
hints:
  - Sort by start. Now an interval can only overlap the group you're currently building.
  - If the next interval starts at or before the current group's end, extend the end (with a max); otherwise start a new group.
complexity: { time: "O(n log n)", space: "O(n)" }
---

`intervals[i] = [start, end]` is a closed range on the number line. Two ranges overlap if they share at least one point, so `[1, 3]` and `[3, 5]` overlap.

Merge every group of overlapping ranges into a single range and return the resulting non-overlapping ranges, **sorted by start**.

## Constraints

- `1 <= intervals.length <= 10^4`
- `0 <= start <= end <= 10^4`
