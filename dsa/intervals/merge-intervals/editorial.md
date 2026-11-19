**Key idea:** sort by start time. Then overlapping intervals sit next to each other, and you can sweep once: either the next interval overlaps the last merged one (extend it) or it starts after it ends (begin a new merged interval).

## Recognising the pattern

"Combine overlapping ranges" is the core move of the [Intervals](/problems/patterns/intervals) sheet. Almost every interval problem either is this or uses it as a step (Insert Interval, Employee Free Time, Partition Labels).

## Alternative: paint the number line (shown below)

Mark every covered point on an array and read back the runs of marked points. To keep `[1, 2]` and `[3, 4]` apart (they don't overlap), the axis is doubled: point `x` becomes `2x`, so the gap at 2.5 is a real cell. That is the reference brute force below. `O(n · range)`, fine for small coordinates, useless for coordinates up to `10^9`.

## Sort and sweep

1. Sort a copy by start.
2. For each interval `[start, end]`:
   - If `merged` is non-empty and `start ≤ last.end`: set `last.end = max(last.end, end)`.
   - Otherwise append `[start, end]`.
3. Return `merged`.

**Why `max` when extending.** An interval can sit entirely inside the previous one (`[1, 10]` then `[2, 3]`). Setting `last.end = end` would shrink it to 3.

**Why sorting by start is enough.** After sorting, any interval that overlaps the current merged block starts no later than the block's end, and all of them come before any interval that starts after it.

## Walkthrough

`intervals = [[5, 7], [1, 4], [6, 9], [11, 12]]`, sorted: `[1, 4], [5, 7], [6, 9], [11, 12]`.

| interval | last merged | overlaps? | merged after |
| --- | --- | --- | --- |
| [1, 4] | – | – | [1, 4] |
| [5, 7] | [1, 4] | 5 > 4, no | [1, 4], [5, 7] |
| [6, 9] | [5, 7] | 6 ≤ 7, yes | [1, 4], [5, 9] |
| [11, 12] | [5, 9] | 11 > 9, no | [1, 4], [5, 9], [11, 12] |

## Complexity

- Painting: `O(n · range)`.
- Repeatedly merging any overlapping pair until none remain: `O(n³)` or so.
- Sort and sweep: `O(n log n)` time, `O(n)` for the output.

## Edge cases

- One interval: itself.
- Touching intervals (`[2, 5]` and `[5, 8]`): merged here, because the problem treats shared endpoints as overlapping. Check the definition each time.
- One interval containing all others: a single result.

## Common mistakes

- Forgetting to sort.
- Overwriting the end instead of taking the maximum.
- Mutating the input intervals while merging (copy them, or say that you mutate).

## In the interview

- Ask whether touching intervals should merge; it decides `<` versus `<=`.
- Likely follow-ups:
  - *Intervals arrive one at a time?* Keep them in a balanced BST or sorted list keyed by start, and merge with neighbours on insert.
  - *Insert one interval into a sorted, merged list?* [Insert Interval](/problems/insert-interval), `O(n)` without sorting.
  - *Total covered length?* Sum the lengths of the merged intervals.
