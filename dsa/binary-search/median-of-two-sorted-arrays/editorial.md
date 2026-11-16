**Key insight:** don't merge — choose how many elements `i` the left half takes from the shorter array; then `j = half - i` from the other is forced. The cut is right when `nums1[i-1] <= nums2[j]` and `nums2[j-1] <= nums1[i]`, and that condition is binary-searchable in `i`.

## Approach

1. Make `nums1` the shorter array (swap if needed). Let `half = ⌈(m + n) / 2⌉`.
2. Binary search `i` in `[0, m]`, with `j = half - i`. Read the four border values, using `-∞` / `+∞` when a side is empty:
   - `L1 = nums1[i-1]`, `R1 = nums1[i]`, `L2 = nums2[j-1]`, `R2 = nums2[j]`.
3. If `L1 > R2`, too many from `nums1` → `hi = i - 1`. If `L2 > R1`, too few → `lo = i + 1`.
4. Otherwise the cut is valid: the median is `max(L1, L2)` for an odd total, or `(max(L1, L2) + min(R1, R2)) / 2` for even.

## Complexity

- Time `O(log(min(m, n)))` — the search runs on the shorter array.
- Space `O(1)`.

## Alternatives to mention

- Merge then pick the middle: `O(m + n)` time and space. Or merge with two pointers and stop at the middle: `O(m + n)` time, `O(1)` space. Say this first — it's correct and quick.
- k-th smallest of two sorted arrays by discarding `k/2` elements at a time: `O(log(m + n))`, generalises to any rank.

## Pitfalls

- Searching on the longer array lets `j` go negative or past `n`.
- Forgetting the sentinels for `i = 0`, `i = m`, `j = 0`, `j = n` — that's where most bugs live.
- One array empty: the swap guarantees `nums1` is the empty one, so `i = 0` and everything comes from `nums2`.
