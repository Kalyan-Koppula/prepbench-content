**Key insight:** the free space is at the **end** of `nums1`. Merge from the back — repeatedly place the larger of the two tails at the last empty slot — and nothing unread ever gets overwritten.

## Approach

1. `i = m - 1` (last real value in `nums1`), `j = n - 1` (last in `nums2`), `k = m + n - 1` (write position).
2. While `j >= 0`: if `i >= 0 && nums1[i] > nums2[j]`, write `nums1[i--]`; otherwise write `nums2[j--]`. Decrement `k` each time.
3. When `nums2` is exhausted, the remaining `nums1` prefix is already in place.

**Why it's safe:** the write index `k = i + j + 1` is always ahead of `i` while `nums2` still has values, so the write never clobbers an unread `nums1` value.

## Complexity

- Time `O(m + n)` — each value is written once.
- Space `O(1)`.

## Alternatives to mention

- Copy `nums2` into the tail and sort: `O((m + n) log(m + n))` — easy but ignores sortedness.
- Merge forward into a new array and copy back: `O(m + n)` time, `O(m)` space.

## Pitfalls

- Looping `while (i >= 0 && j >= 0)` and then forgetting leftover `nums2` values. Leftover `nums1` values need no work.
- `m = 0`: everything comes from `nums2`.
