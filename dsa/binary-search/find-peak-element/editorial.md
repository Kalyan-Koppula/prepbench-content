**Key idea:** look at `mid` and its right neighbour. If the array goes **uphill** to the right, a peak must exist somewhere to the right; if it goes downhill, a peak exists at `mid` or to its left. Either way, half the range can be discarded, even though the array isn't sorted.

## Recognising the pattern

`O(log n)` on unsorted data means binary search on a **property**, not on values. The [Binary Search](/problems/patterns/binary-search) sheet's general rule applies: you can discard half the range whenever a test on `mid` tells you which half is guaranteed to contain an answer. Here the test is the slope at `mid`.

## Brute force

Scan left to right and return the first index where the next value is smaller; if the array never drops, the last element is a peak. That is the reference brute force below.

Correct because the first drop happens right after a local maximum (the edges count as −∞). Time `O(n)`, space `O(1)`.

## Optimal: binary search on the slope

Invariant: `[lo, hi]` always contains a peak.

1. `lo = 0`, `hi = n − 1`.
2. While `lo < hi`:
   1. `mid = lo + floor((hi − lo) / 2)`. Since `lo < hi`, `mid + 1` is always inside the range.
   2. If `nums[mid] < nums[mid + 1]`: `lo = mid + 1`.
   3. Otherwise: `hi = mid`.
3. Return `lo`.

**Why uphill means a peak to the right.** Start at `mid + 1` and keep walking right while the values keep rising. Either they eventually drop, and the last rising value is a peak, or you reach the end, and the last element is a peak because the outside counts as −∞. Either way there is a peak in `(mid, hi]`. The downhill case is the mirror image, and `mid` itself may be the peak, so it stays in the range.

**Why `lo < hi` and `hi = mid`.** This is the "shrink to one element" form of binary search: the loop stops when one candidate is left, and that candidate is the answer.

## Walkthrough

`nums = [1, 2, 1, 3, 5, 6, 4]`

| lo | hi | mid | nums[mid], nums[mid+1] | slope | next |
| --- | --- | --- | --- | --- | --- |
| 0 | 6 | 3 | 3, 5 | uphill | lo = 4 |
| 4 | 6 | 5 | 6, 4 | downhill | hi = 5 |
| 4 | 5 | 4 | 5, 6 | uphill | lo = 5 |

`lo = hi = 5`, and `nums[5] = 6` is a peak. Index 1 is also a peak; either answer is accepted.

## Complexity

- Linear scan: time `O(n)`, space `O(1)`.
- Slope search: time `O(log n)`, space `O(1)`.

## Edge cases

- One element: it is a peak (both neighbours are −∞).
- Strictly increasing: the answer is the last index.
- Strictly decreasing: the answer is index 0.
- Several peaks: any one is fine, and the search may return a different one than the scan.

## Common mistakes

- Comparing with `nums[mid − 1]` and stepping out of bounds when `mid = 0`.
- `while (lo <= hi)` with `hi = mid`, which can loop forever.
- Assuming the array must be sorted for binary search to apply.

## In the interview

- Explain the "keep walking uphill" argument; it is what justifies discarding half.
- Clarify that adjacent values differ. With equal neighbours the slope test can't decide, and the worst case becomes `O(n)`.
- Likely follow-ups:
  - *2-D peak?* Binary search on columns: find the maximum of the middle column and move toward a larger neighbour. `O(m log n)`.
  - *Peak in a mountain array (one peak)?* The same search returns it.
