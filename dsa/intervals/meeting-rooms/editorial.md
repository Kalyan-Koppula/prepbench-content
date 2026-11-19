**Key idea:** sort the meetings by start time. If any two meetings overlap, then some meeting overlaps the one **right before it** in that order. So one pass comparing each meeting's start with the previous meeting's end is enough.

## Recognising the pattern

Questions about overlaps in a set of ranges almost always start with "sort by start", the first move in the [Intervals](/problems/patterns/intervals) sheet. Sorting turns an all-pairs question into a neighbours question.

## Brute force

Compare every pair: two meetings `[a, b)` and `[c, d)` clash when `max(a, c) < min(b, d)`. That is the reference brute force below. `O(n²)` time, `O(1)` space.

## Sort and compare neighbours

1. Sort a copy of the meetings by start.
2. For each `i ≥ 1`: if `start[i] < end[i − 1]`, return false.
3. Return true.

**Why neighbours are enough.** Suppose no neighbouring pair clashes: each meeting ends by the time the next one starts. Then the meetings form a chain, each finished before the next begins, so no two meetings anywhere overlap. Turned around: if any pair overlaps, some neighbouring pair does.

**Touching is not overlapping.** Meetings are half-open: one ending at 4 and another starting at 4 don't clash, so the test is strict `<`.

## Walkthrough

`intervals = [[9, 11], [13, 15], [10, 12]]`, sorted: `[9, 11], [10, 12], [13, 15]`.

| i | meeting | previous end | start < previous end? |
| --- | --- | --- | --- |
| 1 | [10, 12] | 11 | **10 < 11, clash** |

Answer `false`. For `[[1, 4], [4, 6], [7, 8]]`: `4 < 4` is false and `7 < 6` is false, so `true`.

## Complexity

- All pairs: `O(n²)`.
- Sort and scan: `O(n log n)` time, `O(n)` for the sorted copy (or `O(1)` if sorting in place is allowed).

## Edge cases

- No meetings or one meeting: true.
- Back-to-back meetings: true.
- Identical meetings: false.

## Common mistakes

- Using `<=`, which treats back-to-back meetings as a clash.
- Comparing only with the first meeting instead of the previous one.
- Sorting by end time and comparing starts in the wrong direction.

## In the interview

- Say "sort by start, compare neighbours" and justify why neighbours suffice.
- Likely follow-ups:
  - *How many rooms are needed?* [Meeting Rooms II](/problems/meeting-rooms-ii).
  - *Remove the fewest meetings so the rest fit in one room?* [Non-overlapping Intervals](/problems/non-overlapping-intervals).
