**Key idea:** a rotated sorted array is two ascending runs, and the minimum is the first element of the second run. Compare `nums[mid]` with `nums[hi]`: if `mid` is bigger, it sits in the first (larger) run and the minimum is to its right; otherwise `mid..hi` is ascending and the minimum is at `mid` or to its left.

## Recognising the pattern

`O(log n)` on data that is "almost sorted" means binary search on a property, as in the [Binary Search](/problems/patterns/binary-search) sheet. The property here is "which run is `mid` in?", and comparing with the last element of the range answers it.

## Brute force

Scan for the smallest value. That is the reference brute force below. Time `O(n)`, space `O(1)`. It ignores the structure completely.

## Optimal: binary search against the right end

Invariant: the minimum is in `[lo, hi]`.

1. `lo = 0`, `hi = n − 1`.
2. While `lo < hi`:
   1. `mid = lo + floor((hi − lo) / 2)`.
   2. If `nums[mid] > nums[hi]`: `mid` is in the first run, and the drop (the minimum) is somewhere in `(mid, hi]`. Set `lo = mid + 1`.
   3. Otherwise `nums[mid] < nums[hi]` (values are distinct), so `mid..hi` is one ascending stretch and its smallest element is `nums[mid]`. The minimum is `mid` or something to its left: `hi = mid`.
3. Return `nums[lo]`.

**Why compare with `hi`, not `lo`?** If the array isn't rotated at all, `nums[lo] < nums[mid]` holds even though the minimum is at `lo`, so a comparison with `lo` doesn't tell you which side to drop. Comparing with `hi` works for every rotation, including none.

## Walkthrough

`nums = [4, 5, 6, 7, 0, 1, 2]`

| lo | hi | mid | nums[mid] vs nums[hi] | next |
| --- | --- | --- | --- | --- |
| 0 | 6 | 3 | 7 > 2 | lo = 4 |
| 4 | 6 | 5 | 1 < 2 | hi = 5 |
| 4 | 5 | 4 | 0 < 1 | hi = 4 |

`lo = hi = 4`, so the minimum is `0`.

## Complexity

- Linear scan: time `O(n)`, space `O(1)`.
- Binary search: time `O(log n)`, space `O(1)`.

## Edge cases

- No rotation (or a full rotation): `nums[mid] < nums[hi]` every time, so `hi` walks down to 0.
- One element: returned directly.
- Two elements, rotated, like `[2, 1]`: `mid = 0`, 2 > 1, `lo = 1`.
- Minimum at the last index, like `[2, 3, 4, 1]`: `lo` keeps moving right.

## Common mistakes

- `hi = mid − 1` in the second case, which can skip the minimum when it is at `mid`.
- Comparing with `nums[lo]` and failing on unrotated input.
- `while (lo <= hi)` with `hi = mid`, which loops forever.

## In the interview

- Draw the two runs. The picture makes the comparison obvious.
- Likely follow-ups:
  - *Duplicates allowed?* When `nums[mid] == nums[hi]` you can't tell the side; shrink with `hi−−`. The worst case becomes `O(n)`.
  - *How many times was it rotated?* The index of the minimum.
  - *Search for a target?* Find the minimum's index, then binary search the correct run, or use the one-pass method (Search in Rotated Sorted Array).
