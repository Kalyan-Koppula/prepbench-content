---
title: Intervals
order: 17
summary: Sort by start (or end), then sweep once — merging, counting overlaps or choosing what to keep.
---

## The idea

An interval is a range `[start, end]`: a meeting, a booking, a train's stay at a station, a range of numbers. Interval problems ask questions about a whole set of them. Do any overlap? What does their union look like? How many overlap at once? Which ones should be kept?

Looking at every pair costs `O(n²)`. Almost every interval problem avoids that the same way: **sort, then sweep once**. After sorting by start, intervals that overlap sit next to each other, so each interval only needs to be compared with the current "open" state, not with everything.

```
unsorted:   [5,7]  [1,4]  [6,9]  [11,12]

sorted by start, on a number line:
1   2   3   4   5   6   7   8   9  10  11  12
[===========]
                [=======]
                    [===========]
                                    [===]
merged:     [1,4]        [5,9]          [11,12]
```

The overlapping pair `[5, 7]` and `[6, 9]` became neighbours after sorting, and the sweep merges them by comparing `6` with the current end `7`.

Before anything else, settle what **overlap** means for the problem:

- **Closed** intervals `[a, b]` include both ends: `[1, 2]` and `[2, 3]` share the point 2 and overlap. (Merge Intervals, Interval List Intersections.)
- **Half-open** intervals `[a, b)` exclude the end: a meeting ending at 2 and one starting at 2 don't clash. (Meeting Rooms, Non-overlapping Intervals.)

That one decision is the difference between `<` and `<=` in every comparison.

## When to reach for it

- The input is a list of `[start, end]` pairs, or times, or ranges.
- "Merge", "insert", "overlap", "free time", "conflict", "rooms", "platforms", "arrows".
- "Keep the most" or "remove the fewest" so nothing overlaps.
- Many queries asking which intervals contain a point.

Look-alikes:

| Statement says | What to use instead |
| --- | --- |
| Sum or count over ranges of an array, with updates | Prefix sums, difference arrays, or a segment tree |
| Intervals with weights, choose the best subset | DP sorted by end, with binary search ([2-D Dynamic Programming](/problems/patterns/dp-2d)) |
| Ranges of letters in a string | Partition Labels in [Greedy](/problems/patterns/greedy), the same merging idea |
| Ranges given implicitly by a condition | [Sliding Window](/problems/patterns/sliding-window) |

## How it works

Three sweeps cover most problems.

**Merge (sort by start).** Keep the last merged interval. Each new interval either overlaps it (extend its end with `max`) or starts a new one.

**Choose the most compatible (sort by end).** Keep the interval that ends earliest, then the next one that starts after it, and so on. An earlier end leaves more room for everything after it.

**Count simultaneous overlaps (sort starts and ends separately).** Walk through time: a start adds one, an end removes one. The peak is the number of rooms or platforms needed.

Here is the counting sweep for meetings `[1, 5], [2, 6], [4, 8], [7, 9]` (half-open):

| time | event | in progress |
| --- | --- | --- |
| 1 | start | 1 |
| 2 | start | 2 |
| 4 | start | **3** |
| 5 | end | 2 |
| 6 | end | 1 |
| 7 | start | 2 |
| 8 | end | 1 |
| 9 | end | 0 |

Peak 3: three rooms. The **invariant** of every sweep: after processing time `t`, the state (last merged interval, last kept end, or the count in progress) correctly describes everything up to `t`, so nothing before `t` needs looking at again.

## Templates

### Merge overlapping intervals

```ts
function mergeAll(intervals: number[][]): number[][] {
  const sorted: number[][] = []
  for (let i = 0; i < intervals.length; i++) {
    sorted.push(intervals[i])
  }
  sorted.sort((a, b) => a[0] - b[0]) // by start
  const merged: number[][] = []
  for (let i = 0; i < sorted.length; i++) {
    if (merged.length > 0 && sorted[i][0] <= merged[merged.length - 1][1]) {
      const last = merged[merged.length - 1]
      last[1] = Math.max(last[1], sorted[i][1]) // extend, never shrink
    } else {
      merged.push([sorted[i][0], sorted[i][1]])
    }
  }
  return merged
}
```

- `<=` merges touching intervals; use `<` if they should stay apart.

### Keep the most non-overlapping (earliest end)

```ts
function mostCompatible(intervals: number[][]): number {
  const sorted: number[][] = []
  for (let i = 0; i < intervals.length; i++) {
    sorted.push(intervals[i])
  }
  sorted.sort((a, b) => a[1] - b[1]) // by END
  let kept = 0
  let lastEnd = -Infinity
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i][0] >= lastEnd) {
      kept++
      lastEnd = sorted[i][1]
    }
  }
  return kept
}
```

### Count the peak overlap

```ts
function peakOverlap(intervals: number[][]): number {
  const starts: number[] = []
  const ends: number[] = []
  for (let i = 0; i < intervals.length; i++) {
    starts.push(intervals[i][0])
    ends.push(intervals[i][1])
  }
  starts.sort((a, b) => a - b)
  ends.sort((a, b) => a - b)
  let inUse = 0
  let peak = 0
  let e = 0
  for (let s = 0; s < starts.length; s++) {
    while (ends[e] <= starts[s]) { // half-open: an end at time t frees the room for a start at t
      inUse--
      e++
    }
    inUse++
    peak = Math.max(peak, inUse)
  }
  return peak
}
```

- Sorting starts and ends separately is valid because only the count matters, not which interval is which.
- The alternative is a min-heap of end times, one per room in use; it also tells you which room each interval gets.

### Two sorted lists (two pointers)

```ts
// Overlap of A[i] and B[j] is [max(starts), min(ends)] if non-empty.
// Then advance whichever ends first: it can't meet anything later.
```

### Choosing a template

- Produce the union, or insert into it: **merge** (sort by start).
- Keep the most, remove the fewest, fewest arrows: **earliest end** (sort by end).
- How many at once (rooms, platforms): **peak overlap**.
- Two sorted lists: **two pointers**.
- Many point queries: **offline sweep** with a heap (sort queries too).

## Choosing the sort key

| Problem | Sort by | Then |
| --- | --- | --- |
| Meeting Rooms | start | compare each start with the previous end |
| Merge Intervals | start | extend or start a new merged interval |
| Insert Interval | already sorted | copy before, absorb overlaps, copy after |
| Non-overlapping Intervals | end | keep each interval that starts after the last kept end |
| Meeting Rooms II | starts and ends separately | sweep, counting in-progress meetings |
| Interval List Intersections | already sorted | two pointers, advance the earlier end |
| Minimum Interval to Include Each Query | start, and queries | heap of active intervals by size |

## Worked problems

**Merge Intervals.** Sort by start; extend the last merged interval while the next one starts within it, using `max` for the end so a contained interval doesn't shrink it.

**Insert Interval.** The input is sorted and disjoint, so it splits into before, overlapping and after. Copy, absorb, copy: `O(n)` with no sort.

**Non-overlapping Intervals.** "Remove the fewest" is "keep the most". Sort by end and keep greedily. The exchange argument: replacing any optimal set's first interval with the earliest-ending one never causes a clash.

**Meeting Rooms II.** Rooms needed = the peak number of meetings in progress. Sort starts and ends separately and sweep.

## Variations and tricks

- **Closed versus half-open.** Decide up front; it fixes every `<` and `<=`.
- **Difference arrays.** When times are small integers, add +1 at each start and −1 after each end, then take prefix sums: `O(n + T)`.
- **Offline queries.** Sort the queries along with the intervals and answer them in sweep order, putting answers back by index.
- **Sweep events.** Turn every interval into two events `(time, +1)` and `(time, −1)`, sort them, and walk. Break ties deliberately (ends before starts for half-open intervals).
- **Free time.** Merge everyone's busy intervals; the gaps between merged intervals are the free slots (Employee Free Time).
- **Balanced BST.** For intervals arriving online, a sorted map keyed by start finds the neighbours to merge with in `O(log n)`.

## Complexity

- Sorting dominates: `O(n log n)`. The sweep itself is `O(n)`.
- Two sorted lists: `O(n + m)`.
- Offline queries with a heap: `O((n + q) log n)`.
- Space: `O(n)` for sorted copies or the output.

## Pitfalls

- Forgetting to sort, or sorting by the wrong key (start versus end).
- `<` versus `<=` for touching intervals.
- Shrinking a merged interval when a contained interval comes next (use `max`).
- Comparing each interval only with its predecessor when three or more can overlap (Meeting Rooms II).
- Mutating the input's inner arrays while merging, then reusing them elsewhere.

## Practice ladder

1. [Meeting Rooms](/problems/meeting-rooms): sort by start, compare neighbours.
2. [Merge Intervals](/problems/merge-intervals): the basic sweep.
3. [Insert Interval](/problems/insert-interval): three phases on an already sorted list.
4. [Non-overlapping Intervals](/problems/non-overlapping-intervals): earliest end first.
5. [Meeting Rooms II](/problems/meeting-rooms-ii): counting the peak overlap.
6. [Interval List Intersections](/problems/interval-list-intersections): two pointers over two sorted lists.
7. [Minimum Interval to Include Each Query](/problems/minimum-interval-to-include-each-query): an offline sweep with a heap.
