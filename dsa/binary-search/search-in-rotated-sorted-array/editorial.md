**Key insight:** cut at `mid` and one side is always a clean sorted run. Check whether `target` falls inside that run's range; if yes go there, otherwise go to the other side.

## Approach

1. Standard `lo <= hi` loop; return `mid` on a hit.
2. If `nums[lo] <= nums[mid]`, the left half `[lo, mid]` is sorted:
   - `nums[lo] <= target < nums[mid]` → `hi = mid - 1`, else `lo = mid + 1`.
3. Otherwise the right half `[mid, hi]` is sorted:
   - `nums[mid] < target <= nums[hi]` → `lo = mid + 1`, else `hi = mid - 1`.
4. Return `-1` when the window empties.

## Complexity

- Time `O(log n)`, space `O(1)`.

## Alternatives to mention

- Two passes: find the pivot (index of the minimum, as in Find Minimum in Rotated Sorted Array), then run ordinary binary search on the half whose range contains `target`. Same complexity, easier to get right under pressure.
- Linear scan: `O(n)` — state it, then improve.

## Pitfalls

- Use `<=` in `nums[lo] <= nums[mid]`: when `lo === mid` the "left half" is a single element and is trivially sorted.
- Getting the strict vs. non-strict range checks wrong; `nums[mid]` was already compared, so exclude it from both ranges.
- With duplicates (Search in Rotated Sorted Array II) `nums[lo] === nums[mid] === nums[hi]` hides which side is sorted — shrink both ends, worst case `O(n)`.
