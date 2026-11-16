**Key insight:** one comparison against the middle element rules out half of the remaining range, so after `log n` steps the range is empty or you've hit the target.

## Approach

1. Keep `lo = 0`, `hi = n - 1` — the target, if present, is inside `[lo, hi]`.
2. While `lo <= hi`, look at `mid`:
   - equal → return `mid`;
   - `nums[mid] < target` → the target must be right of `mid`, so `lo = mid + 1`;
   - otherwise `hi = mid - 1`.
3. If the window empties, return `-1`.

## Complexity

- Time `O(log n)` — the window halves every iteration.
- Space `O(1)`.

## Pitfalls

- `while (lo < hi)` with `hi = mid - 1` skips checking the last remaining element. Pair `<=` with `mid ± 1`.
- `lo = mid` (instead of `mid + 1`) can loop forever when `hi = lo + 1`.
- In languages with fixed-width ints, `(lo + hi) / 2` can overflow; `lo + (hi - lo) / 2` is the habit interviewers like to see.

## Follow-ups

- Return the insertion position instead of `-1` (lower bound): use the `lo < hi`, `hi = mid` template with `hi = n`.
- First/last occurrence when duplicates are allowed: don't stop on equality, keep shrinking toward the side you want.
