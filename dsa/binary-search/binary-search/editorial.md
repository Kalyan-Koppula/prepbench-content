**Key idea:** compare the target with the middle element of the range that could still contain it. Equal: done. Smaller: the target can only be in the left half. Larger: only in the right half. Each comparison halves the range, so at most about `log₂ n` steps are needed.

## Recognising the pattern

A **sorted** array and an `O(log n)` requirement is the most direct signal there is for the [Binary Search](/problems/patterns/binary-search) sheet. This problem is the plain template; nearly every other binary search problem is this loop with a different test in the middle.

## Brute force

Scan from the left and return the first index whose value equals the target, or −1. That is the reference brute force below.

Correct, but `O(n)` time, and it ignores the sorted order the problem gives you. Space `O(1)`.

## Optimal: classic binary search

Keep the **invariant**: if the target exists, its index is in `[lo, hi]`.

1. `lo = 0`, `hi = n − 1`.
2. While `lo <= hi`:
   1. `mid = lo + floor((hi − lo) / 2)`.
   2. If `nums[mid]` equals the target, return `mid`.
   3. If `nums[mid] < target`, every index up to `mid` holds a smaller value: `lo = mid + 1`.
   4. Otherwise every index from `mid` on holds a larger value: `hi = mid − 1`.
3. The range is empty, so the target isn't there: return −1.

**Why `lo <= hi`?** The range `[lo, hi]` is inclusive, so a range with one element has `lo == hi` and must still be checked. The loop stops only when the range is empty (`lo > hi`).

**Why `lo + (hi − lo) / 2`?** In languages with fixed-size integers, `lo + hi` can overflow for very large arrays. Writing it this way never exceeds `hi`. JavaScript numbers don't overflow here, but the habit costs nothing.

## Walkthrough

`nums = [-1, 0, 3, 5, 9, 12]`, `target = 9`

| lo | hi | mid | nums[mid] | comparison | next |
| --- | --- | --- | --- | --- | --- |
| 0 | 5 | 2 | 3 | 3 < 9 | lo = 3 |
| 3 | 5 | 4 | 9 | equal | return 4 |

For `target = 2`: `mid = 2` (3 > 2, `hi = 1`), `mid = 0` (−1 < 2, `lo = 1`), `mid = 1` (0 < 2, `lo = 2`). Now `lo > hi`, so return −1.

## Complexity

- Linear scan: time `O(n)`, space `O(1)`.
- Binary search: time `O(log n)`, the range halves each step. Space `O(1)`.

## Edge cases

- One element: one comparison.
- Target smaller than everything or larger than everything: the range shrinks to empty at one end.
- Target at index 0 or `n − 1`: found when the range narrows to it.

## Common mistakes

- `while (lo < hi)` with `hi = mid − 1`, which skips the last remaining element.
- `lo = mid` or `hi = mid` with an inclusive range, which can loop forever when `lo` and `hi` are adjacent.
- Computing `mid` with `/` and no floor in JavaScript, giving a fractional index.

## In the interview

- State the invariant before writing the loop. It decides `<=` versus `<` and `mid ± 1` versus `mid`.
- Test by hand on a two-element array, the case where off-by-one bugs show up.
- Likely follow-ups:
  - *First or last position of a target with duplicates?* Keep searching after a match: move `hi` left to find the first, `lo` right for the last (lower and upper bound).
  - *Insert position?* Return `lo` when the loop ends; it is where the target would go.
  - *Rotated array?* Decide which half is sorted at each step (Search in Rotated Sorted Array).
