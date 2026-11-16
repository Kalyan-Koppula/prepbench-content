---
title: Intervals
order: 17
summary: Sort by start (or end), then sweep — overlaps only ever involve neighbours.
---

## Recognise it

- Input is a list of `[start, end]` pairs: meetings, bookings, ranges, segments.
- "Merge", "insert", "remove the fewest to make non-overlapping", "how many at once", "do any conflict".
- Queries of the form "which interval contains point `x`" or "smallest interval covering `x`".

## Templates

```ts
// Merge overlapping intervals
intervals.sort((a, b) => a[0] - b[0])
const merged: number[][] = []
for (const [s, e] of intervals) {
  const last = merged[merged.length - 1]
  if (last && s <= last[1]) last[1] = Math.max(last[1], e)
  else merged.push([s, e])
}
```

```ts
// Max simultaneous intervals: sweep sorted start/end events
const starts = intervals.map((i) => i[0]).sort((a, b) => a - b)
const ends = intervals.map((i) => i[1]).sort((a, b) => a - b)
let active = 0, best = 0
for (let i = 0, j = 0; i < starts.length; i++) {
  while (ends[j] <= starts[i]) { j++; active-- } // freed before this start
  best = Math.max(best, ++active)
}
```

## Interview notes

- Pin down the boundary rule first: do `[1, 3]` and `[3, 5]` overlap? Closed intervals say yes; meeting slots usually say no.
- Two intervals `[a, b]` and `[c, d]` overlap iff `max(a, c) <= min(b, d)` (use `<` for half-open).
- Sort by **start** to merge or insert; sort by **end** for greedy "keep the most non-overlapping" (activity selection).
- A min-heap of end times tracks "rooms in use" when you need to know which interval frees up next.
- Two sorted lists → two pointers; advance whichever interval ends first.
- Sorting dominates: `O(n log n)`. Say so before writing the loop.

## Pitfalls

- Sorting with the default `sort()` — it compares as strings (`[10, 9]` stays put). Always pass a comparator.
- Forgetting `Math.max` when merging: `[1, 10]` followed by `[2, 3]` must stay `[1, 10]`.
- Mutating the input's inner arrays when the caller still needs them — copy if in doubt.
- Off-by-one with touching endpoints; re-read the statement's definition of overlap.
