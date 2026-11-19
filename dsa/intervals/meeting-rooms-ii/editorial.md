**Key idea:** the number of rooms needed is the largest number of meetings happening at the same moment. Sort all start times and all end times **separately**, then sweep through time: each start takes a room, each end that has happened by then frees one. The peak is the answer.

## Recognising the pattern

"How many resources are needed at once?" over intervals is the sweep line from the [Intervals](/problems/patterns/intervals) sheet. Which meeting uses which room doesn't affect the count, so starts and ends can be sorted independently. [Minimum Platforms](/problems/minimum-platforms) is the same problem with closed intervals.

## Brute force

The count of meetings in progress only rises at a start time, so the peak happens at some start. For each start `t`, count meetings with `start ≤ t < end`. That is the reference brute force below. `O(n²)` time.

## Two sorted arrays

1. `starts` and `ends`, each sorted.
2. `inUse = 0`, `most = 0`, `e = 0`.
3. For each start `s` in order:
   1. While `ends[e] ≤ s`: a meeting finished, so `inUse--`, `e++`.
   2. `inUse++`; `most = max(most, inUse)`.
4. Return `most`.

**Why `≤`.** Meetings are half-open: one ending at 8 frees its room for another starting at 8.

**The heap alternative.** Sort meetings by start and keep a min-heap of end times, one per room in use. For each meeting, if the earliest end is `≤` its start, reuse that room (pop); then push its end. The heap's final size is the answer. Same `O(n log n)`, and it also tells you which room each meeting gets.

## Walkthrough

`intervals = [[1, 5], [2, 6], [4, 8], [7, 9]]`: starts `1, 2, 4, 7`, ends `5, 6, 8, 9`.

| start | ends freed | in use | most |
| --- | --- | --- | --- |
| 1 | – | 1 | 1 |
| 2 | – | 2 | 2 |
| 4 | – | 3 | 3 |
| 7 | 5, 6 | 3 − 2 + 1 = 2 | 3 |

Answer `3`: at time 4, `[1, 5]`, `[2, 6]` and `[4, 8]` are all running.

## Complexity

- Check at each start: `O(n²)`.
- Two sorted arrays: `O(n log n)` time, `O(n)` space.
- Min-heap of end times: `O(n log n)` time, `O(n)` space.

## Edge cases

- No meetings: 0. One meeting: 1.
- Back-to-back meetings: one room.
- All meetings identical: `n` rooms.

## Common mistakes

- Using `<` for ends, which needs an extra room for back-to-back meetings.
- Comparing each meeting only with the previous one, which undercounts when three overlap.
- Thinking that sorting starts and ends separately loses information; for counting, it doesn't.

## In the interview

- Explain why only the count matters, then pick either the two-array sweep or the heap.
- Likely follow-ups:
  - *Which room does each meeting get?* The heap version, storing `(end, room)` pairs.
  - *Can one person attend all?* [Meeting Rooms](/problems/meeting-rooms): the answer is 1 room.
  - *Times in a small range?* A difference array over time gives `O(n + T)`.
