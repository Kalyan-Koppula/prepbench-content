---
title: Meeting Rooms II
difficulty: Medium
order: 5
lists: [neetcode150]
tags: [intervals, heap, sweep-line]
leetcode: meeting-rooms-ii
function: minMeetingRooms
params:
  - { name: intervals, type: "number[][]" }
returns: number
hints:
  - The answer is the largest number of meetings happening at the same moment.
  - Process meetings by start time. Before placing one, free any room whose meeting has already ended — a min-heap of end times tells you the earliest one.
  - Alternatively, sort starts and ends separately and sweep them with two pointers.
complexity: { time: "O(n log n)", space: "O(n)" }
---

`intervals[i] = [start, end]` is a meeting occupying the half-open time range `[start, end)`. A room freed at time `t` can host a meeting that starts at `t`.

Return the minimum number of rooms needed to hold all the meetings.

## Constraints

- `1 <= intervals.length <= 10^4`
- `0 <= start < end <= 10^6`
