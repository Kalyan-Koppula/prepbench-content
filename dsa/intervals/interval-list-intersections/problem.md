---
title: Interval List Intersections
difficulty: Medium
order: 6
lists: [extra]
tags: [intervals, two-pointers]
leetcode: interval-list-intersections
function: intervalIntersection
params:
  - { name: firstList, type: "number[][]" }
  - { name: secondList, type: "number[][]" }
returns: "number[][]"
hints:
  - Two closed ranges `[a, b]` and `[c, d]` intersect in `[max(a, c), min(b, d)]` when that range is non-empty.
  - Walk both lists with one pointer each. After comparing the current pair, advance the one that ends first — it can't meet anything further along the other list.
complexity: { time: "O(m + n)", space: "O(m + n) for the output" }
---

You're given two lists of closed ranges, `firstList` and `secondList`. Within each list the ranges are sorted by start and pairwise disjoint (no two share a point).

Return every range where the two lists overlap — that is, the intersection of the union of `firstList` with the union of `secondList` — as a list of closed ranges sorted by start. A single shared point `x` is reported as `[x, x]`.

## Constraints

- `0 <= firstList.length, secondList.length <= 1000`
- `0 <= start <= end <= 10^9`
- Within each list, `end` of one range is less than `start` of the next.
