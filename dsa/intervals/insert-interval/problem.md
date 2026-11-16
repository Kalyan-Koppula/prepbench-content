---
title: Insert Interval
difficulty: Medium
order: 3
lists: [neetcode150]
tags: [intervals]
leetcode: insert-interval
function: insert
params:
  - { name: intervals, type: "number[][]" }
  - { name: newInterval, type: "number[]" }
returns: "number[][]"
hints:
  - The list is already sorted — no need to sort again. Split it into three parts relative to the new interval.
  - Copy everything that ends before the new interval starts, absorb everything that overlaps it, then copy the rest.
complexity: { time: "O(n)", space: "O(n)" }
---

`intervals` is a list of closed ranges `[start, end]`, sorted by start, with no two ranges sharing a point. You're also given one more closed range, `newInterval`.

Add `newInterval` to the list, merging it with any ranges it overlaps (sharing even a single point counts), and return the resulting list — still sorted by start and still non-overlapping.

## Constraints

- `0 <= intervals.length <= 10^4`
- `intervals` is sorted by start and its ranges are pairwise disjoint.
- `0 <= start <= end <= 10^5` for every range, including `newInterval`.
