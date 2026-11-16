**Key insight:** if `nums[mid] < nums[mid + 1]`, you're on an uphill slope — keep climbing right and you must hit a peak before the `-∞` wall. Otherwise a peak exists at `mid` or to its left. Either way half the array can be dropped.

## Approach

1. `lo = 0`, `hi = n - 1`. Invariant: some peak lies in `[lo, hi]`.
2. While `lo < hi`, compare `nums[mid]` with `nums[mid + 1]` (`mid + 1` is always in range because `mid < hi`):
   - `nums[mid] < nums[mid + 1]` → `lo = mid + 1`;
   - otherwise → `hi = mid` (`mid` itself may be the peak).
3. When `lo === hi`, that index is a peak.

## Complexity

- Time `O(log n)`.
- Space `O(1)`.

## Why it's correct

The sequence from `mid + 1` rightwards either keeps rising until the last element (which then beats the `-∞` boundary) or turns down somewhere — and the turning point is a peak. The same argument mirrored covers the left side.

## Alternatives to mention

- Linear scan for the first `i` with `nums[i] > nums[i + 1]`: `O(n)`, trivially correct — a good opener before optimising.

## Pitfalls

- The array is **not** sorted; binary search works because of the slope argument, not ordering. Say so.
- Comparing with `nums[mid - 1]` instead needs extra bounds checks; `mid + 1` with `lo < hi` avoids them.
