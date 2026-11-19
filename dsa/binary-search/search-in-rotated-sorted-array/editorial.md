**Key idea:** when you split a rotated array at `mid`, at least one half is a normal sorted range. Check whether the target lies inside that sorted half's bounds. If it does, search there; otherwise search the other half. Every step still halves the range.

## Recognising the pattern

A sorted array with one twist and an `O(log n)` goal: the [Binary Search](/problems/patterns/binary-search) sheet's rule is to find a test on `mid` that tells you which half to keep. Values alone don't, because the order is broken at the pivot. But **one side of `mid` is always sorted**, and a sorted range lets you check membership with two comparisons.

## Brute force

Scan for the target. That is the reference brute force below. Time `O(n)`, space `O(1)`.

## Better: find the pivot, then search one run

Find the index of the minimum with binary search (as in Find Minimum in Rotated Sorted Array), then run a normal binary search on whichever run could contain the target. Two `O(log n)` searches. It works, but there are two loops to get right.

## Optimal: one pass, using the sorted half

1. `lo = 0`, `hi = n − 1`.
2. While `lo <= hi`:
   1. `mid = lo + floor((hi − lo) / 2)`. If `nums[mid]` is the target, return `mid`.
   2. If `nums[lo] <= nums[mid]`, the left half `[lo, mid]` is sorted:
      - If `nums[lo] <= target < nums[mid]`, the target can only be on the left: `hi = mid − 1`.
      - Otherwise it can only be on the right: `lo = mid + 1`.
   3. Otherwise the right half `[mid, hi]` is sorted:
      - If `nums[mid] < target <= nums[hi]`, go right: `lo = mid + 1`.
      - Otherwise go left: `hi = mid − 1`.
3. Return −1.

**Why one half is sorted.** The array has at most one "drop" (where a value is followed by a smaller one). The drop can't be in both halves, so the half without it is ascending.

**Why `<=` in `nums[lo] <= nums[mid]`.** When `lo == mid` (a range of one or two elements), the left half is the single element `nums[lo]`, which is trivially sorted. Using `<` would wrongly treat it as unsorted.

## Walkthrough

`nums = [4, 5, 6, 7, 0, 1, 2]`, `target = 0`

| lo | hi | mid | nums[mid] | sorted half | target inside it? | next |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 6 | 3 | 7 | left [4..7] | no | lo = 4 |
| 4 | 6 | 5 | 1 | left [0..1] | yes (0 ≤ 0 < 1) | hi = 4 |
| 4 | 4 | 4 | 0 | – | found | return 4 |

## Complexity

- Linear scan: time `O(n)`, space `O(1)`.
- Pivot then search: time `O(log n)`, space `O(1)`.
- One pass: time `O(log n)`, space `O(1)`.

## Edge cases

- Not rotated: the left half is always sorted, and this reduces to plain binary search.
- One element: one comparison.
- Target equal to `nums[lo]` or `nums[hi]`: the inclusive bounds in the membership tests catch it.
- Target missing: the range empties and the function returns −1.

## Common mistakes

- Strict `nums[lo] < nums[mid]`, which misclassifies the two-element case.
- Exclusive bounds on the wrong side of the membership test, which skip the target when it equals the end of the sorted half.
- Trying to decide the side from `target` and `nums[mid]` alone, as in plain binary search.

## In the interview

- Say "one half is always sorted" first, then show the two membership tests.
- Trace a two-element rotated array like `[3, 1]` with target 1, the case that catches most bugs.
- Likely follow-ups:
  - *Duplicates allowed (Search in Rotated Sorted Array II)?* When `nums[lo] == nums[mid] == nums[hi]`, you can't tell which half is sorted: shrink both ends by one. Worst case `O(n)`.
  - *Return whether it exists only?* Same algorithm with a boolean.
