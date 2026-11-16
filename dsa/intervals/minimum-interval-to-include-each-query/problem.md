---
title: Minimum Interval to Include Each Query
difficulty: Hard
order: 7
lists: [neetcode150]
tags: [intervals, heap, sorting, offline-queries]
leetcode: minimum-interval-to-include-each-query
function: minInterval
params:
  - { name: intervals, type: "number[][]" }
  - { name: queries, type: "number[]" }
returns: "number[]"
hints:
  - Answering queries in increasing order lets you add intervals as their start becomes reachable and never look back.
  - Keep candidate intervals in a min-heap keyed by size. Before reading the top, discard intervals that end before the current query.
  - Remember the original position of each query so you can write answers back in input order.
complexity: { time: "O(n log n + q log q)", space: "O(n + q)" }
---

`intervals[i] = [left, right]` is a closed range of integers whose **size** is `right - left + 1`. For each value in `queries`, find the smallest size among the ranges that contain it (`left <= query <= right`).

Return an array where entry `j` is the answer for `queries[j]`, or `-1` if no range contains `queries[j]`.

## Constraints

- `1 <= intervals.length <= 10^5`
- `1 <= queries.length <= 10^5`
- `1 <= left <= right <= 10^7`
- `1 <= queries[j] <= 10^7`
