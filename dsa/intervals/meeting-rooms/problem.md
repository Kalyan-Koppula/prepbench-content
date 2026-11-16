---
title: Meeting Rooms
difficulty: Easy
order: 1
lists: [neetcode150]
tags: [intervals, sorting]
leetcode: meeting-rooms
function: canAttendMeetings
params:
  - { name: intervals, type: "number[][]" }
returns: boolean
hints:
  - After sorting by start time, which meetings could possibly clash with each other?
  - Only neighbours in sorted order need comparing — check whether each meeting starts before the previous one ends.
complexity: { time: "O(n log n)", space: "O(n)" }
---

`intervals[i] = [start, end]` is a meeting that occupies the half-open time range `[start, end)` — a meeting ending at time `t` does not clash with one starting at `t`.

Return `true` if one person could attend every meeting (no two meetings overlap), otherwise `false`.

## Constraints

- `0 <= intervals.length <= 10^4`
- `0 <= start < end <= 10^6`
