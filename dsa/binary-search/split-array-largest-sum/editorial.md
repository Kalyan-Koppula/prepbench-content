**Key insight:** "minimise the maximum" → binary search on the answer. For a cap `L`, greedily extend each piece until the next element would push it over `L`; if that uses at most `k` pieces, `L` is achievable.

## Approach

1. `lo = max(nums)` (a piece holding the largest element is at least that), `hi = sum(nums)` (one piece).
2. `piecesNeeded(L)`: running sum; when adding `x` would exceed `L`, start a new piece at `x`.
3. First `L` with `piecesNeeded(L) <= k` — `hi = mid` on success, `lo = mid + 1` otherwise.

Why "at most `k`" is enough: if the greedy uses fewer than `k` pieces, you can keep splitting pieces (there are at least `k` elements) without increasing any sum, reaching exactly `k`.

## Complexity

- Time `O(n log S)` where `S = sum(nums)`.
- Space `O(1)`.

## Alternatives to mention

- DP: `dp[j][i]` = best largest sum for the first `i` elements in `j` pieces, with `dp[j][i] = min over p of max(dp[j-1][p], sum(p..i))`. `O(k · n²)` time — correct and a fine fallback, but the binary search is what interviewers expect.
- Identical structure to Capacity To Ship Packages (pieces = days) and Book Allocation / Painter's Partition.

## Pitfalls

- `lo = 0` or `1` instead of `max(nums)`: the greedy then needs a special case for an element larger than `L`.
- Zeros are allowed, so pieces can sum to `0`; the greedy handles it, but don't assume strictly positive values in a proof.
