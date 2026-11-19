**Key idea:** guess a limit `L` on the largest piece sum and ask how many pieces you need if no piece may exceed `L`, cutting greedily. If that is `<= k`, the limit is achievable. Achievability is monotone in `L`, so binary search the smallest achievable limit between the largest element and the total.

## Recognising the pattern

"Minimise the maximum" over ways to cut an array is the signature of **binary search on the answer** in the [Binary Search](/problems/patterns/binary-search) sheet. It is Capacity to Ship Packages in disguise: the pieces are days, and the limit is the capacity.

## Brute force

Trying every way to place `k − 1` cuts is `C(n − 1, k − 1)` options, far too many.

## Better: dynamic programming

`best[p][i]` = the smallest possible largest sum when the first `i` values are cut into `p` pieces. The last piece is `nums[cut..i−1]` for some `cut`, so `best[p][i] = min over cut of max(best[p−1][cut], sum(cut..i−1))`. With prefix sums, each transition is `O(1)`. That is the reference brute force below.

Time `O(k · n²)`, space `O(n)` with rolling rows. Correct and fast enough for these limits, but not the intended solution.

## Optimal: binary search on the limit

**The check.** Walk the array, adding values to the current piece; when the next value would push it over `L`, start a new piece. Greedy cutting gives the fewest pieces for that limit. If it uses at most `k` pieces, `L` is achievable, because a piece can always be split further to reach exactly `k` without raising the maximum (values are non-negative and `k <= n`).

**The range.** The largest piece is at least the biggest single value, and at most the total (one piece).

1. `lo = max(nums)`, `hi = sum(nums)`.
2. While `lo < hi`: `mid = lo + floor((hi − lo) / 2)`. If `piecesNeeded(mid) <= k`, `hi = mid`; else `lo = mid + 1`.
3. Return `lo`.

## Walkthrough

`nums = [7, 2, 5, 10, 8]`, `k = 2`. Range `[10, 32]`.

| lo | hi | mid | greedy pieces | count | fits? |
| --- | --- | --- | --- | --- | --- |
| 10 | 32 | 21 | [7,2,5] [10,8] | 2 | yes → hi = 21 |
| 10 | 21 | 15 | [7,2,5] [10] [8] | 3 | no → lo = 16 |
| 16 | 21 | 18 | [7,2,5] [10,8] | 2 | yes → hi = 18 |
| 16 | 18 | 17 | [7,2,5] [10] [8] | 3 | no → lo = 18 |

Answer `18`: `[7, 2, 5]` and `[10, 8]`.

## Complexity

- DP: time `O(k · n²)`, space `O(n)`.
- Binary search: time `O(n · log(sum))`, space `O(1)`.

## Edge cases

- `k = 1`: the answer is the total.
- `k = n`: every value is its own piece, so the answer is the largest value.
- Zeros in the array: they never force a cut.

## Common mistakes

- Starting `lo` below the largest value, so the greedy check meets a value that can't fit in any piece.
- Treating "fewer than `k` pieces" as a failure. Extra cuts can always be added.
- Mixing up which bound moves when the check passes.

## In the interview

- Point out that it is the same as shipping packages, then reuse that solution.
- Mention the DP as the alternative that also works when pieces have other constraints.
- Likely follow-ups:
  - *Return the cuts?* Run the greedy with the final limit, filling pieces from the right if you need exactly `k`.
  - *Painters' partition, book allocation?* The same problem with different names.
