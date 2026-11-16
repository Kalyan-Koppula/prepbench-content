**Key insight:** compare the middle with the **right end**. If `nums[mid] > nums[hi]`, the wrap-around point (and so the minimum) is strictly right of `mid`; otherwise `mid..hi` is sorted and the minimum is at `mid` or to its left.

## Approach

1. `lo = 0`, `hi = n - 1`. Invariant: the minimum is in `[lo, hi]`.
2. While `lo < hi`:
   - `nums[mid] > nums[hi]` → `lo = mid + 1`;
   - else → `hi = mid`.
3. Return `nums[lo]`.

## Complexity

- Time `O(log n)`, space `O(1)`.

## Pitfalls

- Comparing with `nums[lo]` instead of `nums[hi]` breaks on an un-rotated array: `nums[mid] > nums[lo]` there, yet the minimum is on the left. Comparing with the right end has no such special case.
- `hi = mid - 1` would skip the minimum when `mid` is the minimum.

## Follow-ups

- With duplicates (Find Minimum II), `nums[mid] === nums[hi]` is ambiguous — shrink with `hi--`. Worst case degrades to `O(n)`.
- The index of the minimum is the rotation count, which is the first step of Search in Rotated Sorted Array if you prefer the "find pivot, then binary search one half" approach.
