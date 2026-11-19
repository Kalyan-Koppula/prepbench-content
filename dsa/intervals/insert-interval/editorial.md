**Key idea:** the list is already sorted and non-overlapping, so it splits into three consecutive parts: intervals entirely **before** the new one, intervals that **overlap** it, and intervals entirely **after** it. Copy the first part, absorb the middle part into the new interval, add it, and copy the rest. One pass, no sorting.

## Recognising the pattern

Inserting into a sorted, disjoint list is the merge step from the [Intervals](/problems/patterns/intervals) sheet, applied to one interval. Because the input is sorted, the overlapping intervals are guaranteed to be contiguous.

## Alternative: append and re-merge (shown below)

Add the new interval to the list and run [Merge Intervals](/problems/merge-intervals) from scratch: sort by start and sweep. That is the reference brute force below. `O(n log n)` because of the sort, and simpler to get right, but it ignores the fact that the input is already sorted.

## Three-phase scan

1. While `intervals[i].end < newStart`: copy `intervals[i]`.
2. While `intervals[i].start ≤ newEnd`: absorb it: `newStart = min(newStart, start)`, `newEnd = max(newEnd, end)`.
3. Append `[newStart, newEnd]`.
4. Copy all remaining intervals.

**Why the conditions are exactly these.** An interval is entirely before the new one when it ends before the new one starts. Once that fails, the next interval overlaps the (growing) new interval exactly when it starts no later than its current end. The first interval that starts after that end, and everything after it, is entirely to the right.

## Walkthrough

`intervals = [[1, 2], [5, 6], [8, 10], [13, 15]]`, `newInterval = [4, 9]`

| interval | phase | new interval after | result so far |
| --- | --- | --- | --- |
| [1, 2] | before (2 < 4) | [4, 9] | [1, 2] |
| [5, 6] | overlap (5 ≤ 9) | [4, 9] | [1, 2] |
| [8, 10] | overlap (8 ≤ 9) | [4, 10] | [1, 2] |
| – | append | – | [1, 2], [4, 10] |
| [13, 15] | after | – | [1, 2], [4, 10], [13, 15] |

## Complexity

- Append and re-merge: `O(n log n)`.
- Three-phase scan: `O(n)` time, `O(n)` for the output.
- Binary search can find the overlap boundaries in `O(log n)`, but building the output is still `O(n)`.

## Edge cases

- Empty list: just the new interval.
- New interval before everything, after everything, or covering everything.
- Touching endpoints (`[1, 5]` and `[5, 7]`): they overlap here, because `5 ≤ 5`.

## Common mistakes

- Checking overlap against the **original** new end instead of the growing one.
- Forgetting to append the new interval when nothing overlaps.
- Re-sorting when the input is already sorted.

## In the interview

- Describe the three phases before coding; the loops then write themselves.
- Likely follow-ups:
  - *Many insertions?* Keep the intervals in a balanced BST (a TreeMap keyed by start) and merge with neighbours.
  - *Remove an interval instead?* The same three phases, splitting overlapped intervals into the parts outside the removed range.
