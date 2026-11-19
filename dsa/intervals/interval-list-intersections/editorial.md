**Key idea:** both lists are sorted and internally disjoint, so walk them together with two pointers. At each step, the overlap of the two current intervals is `[max(starts), min(ends)]`, if that range is non-empty. Then advance whichever interval **ends first**: it can't meet anything later in the other list.

## Recognising the pattern

Two sorted lists processed together is the merge step from merge sort, and with intervals it is a standard move in the [Intervals](/problems/patterns/intervals) sheet. The [Two Pointers](/problems/patterns/two-pointers) idea of "advance the side that can't help any more" decides which pointer moves.

## Brute force

Intersect every pair of intervals. Because both lists are sorted and disjoint, looping over the first list on the outside produces the pieces in sorted order already. That is the reference brute force below. `O(n · m)` time.

## Two pointers

1. `i = j = 0`.
2. While both lists have intervals:
   1. `low = max(A[i].start, B[j].start)`, `high = min(A[i].end, B[j].end)`.
   2. If `low ≤ high`, record `[low, high]`.
   3. If `A[i].end < B[j].end`, advance `i`; otherwise advance `j`.
3. Return the recorded pieces.

**Why advance the earlier end.** Say `A[i]` ends first. Every later interval in `B` starts after `B[j]` ends, which is at or after `A[i]` ends, so none of them can touch `A[i]`. It is finished. `B[j]` may still meet `A[i + 1]`.

## Walkthrough

`A = [[1, 4], [6, 9], [12, 15]]`, `B = [[2, 7], [9, 13]]`

| A[i] | B[j] | overlap | advance |
| --- | --- | --- | --- |
| [1, 4] | [2, 7] | [2, 4] | i (4 < 7) |
| [6, 9] | [2, 7] | [6, 7] | j (7 < 9) |
| [6, 9] | [9, 13] | [9, 9] | i (9 < 13) |
| [12, 15] | [9, 13] | [12, 13] | j |

Answer `[[2, 4], [6, 7], [9, 9], [12, 13]]`. Note `[9, 9]`: closed intervals that touch at one point intersect in that point.

## Complexity

- All pairs: `O(n · m)`.
- Two pointers: `O(n + m)` time, `O(1)` extra space beyond the output.

## Edge cases

- Either list empty: no intersections.
- One interval covering many in the other list: it stays while the other pointer advances.
- Single-point intersections: included, since `low ≤ high`.

## Common mistakes

- Advancing both pointers after an overlap, which skips intersections.
- Using `low < high`, which drops single-point intersections.
- Advancing the interval that **starts** first instead of the one that ends first.

## In the interview

- Explain why the earlier-ending interval is finished; the loop is then short.
- Likely follow-ups:
  - *Union instead of intersection?* Merge the two lists by start, then run [Merge Intervals](/problems/merge-intervals)'s sweep.
  - *k lists?* Intersect them pairwise, or sweep all endpoints with a counter and keep ranges where the count is `k`.
