**Key idea:** keep `tails[k]`, the smallest possible last value of an increasing subsequence of length `k + 1` seen so far. That array is always sorted, so for each new number you binary search for the first tail that is `>=` it: replace that tail, or append if there is none. The length of `tails` is the answer.

## Recognising the pattern

LIS is the classic "ending at `i`" DP from the [1-D Dynamic Programming](/problems/patterns/dp-1d) sheet, `O(n²)`. The follow-up asks for better, which is the patience-sorting trick: a DP over **lengths** instead of positions, searched with [Binary Search](/problems/patterns/binary-search).

## Brute force

`length[i]` = the longest increasing subsequence ending at `i` = 1 + the largest `length[j]` over earlier `j` with `nums[j] < nums[i]`. The answer is the largest `length[i]`. That is the reference brute force below. Time `O(n²)`, space `O(n)`. It is the solution to present first.

## Tails with binary search

1. `tails = []`.
2. For each `x`:
   1. Find the first index `lo` with `tails[lo] >= x`.
   2. If `lo` equals the length of `tails`, append `x`: it extends the longest subsequence. Otherwise set `tails[lo] = x`: there is now a subsequence of length `lo + 1` ending in a smaller value.
3. Return `tails.length`.

**Why smaller tails are better.** A subsequence ending in a smaller value can be extended by more future numbers. Keeping, for each length, only the smallest possible tail loses nothing.

**Why `>=` and not `>`.** The subsequence must be strictly increasing, so an equal value can't extend it; it replaces the equal tail instead.

Note that `tails` is not itself an increasing subsequence of the input; only its length is meaningful.

## Walkthrough

`nums = [10, 9, 2, 5, 3, 7, 101, 18]`

| x | position found | tails after |
| --- | --- | --- |
| 10 | 0 (append) | 10 |
| 9 | 0 | 9 |
| 2 | 0 | 2 |
| 5 | 1 (append) | 2, 5 |
| 3 | 1 | 2, 3 |
| 7 | 2 (append) | 2, 3, 7 |
| 101 | 3 (append) | 2, 3, 7, 101 |
| 18 | 3 | 2, 3, 7, 18 |

Answer `4`, for example `2, 3, 7, 18`.

## Complexity

- Ending-at DP: time `O(n²)`, space `O(n)`.
- Tails with binary search: time `O(n log n)`, space `O(n)`.

## Edge cases

- One element: 1.
- Strictly decreasing input: 1; `tails` keeps one element.
- All equal: 1, since equal values never extend.

## Common mistakes

- Searching for the first tail `> x` (that computes the longest non-decreasing subsequence).
- Treating `tails` as the actual subsequence.
- Forgetting the final `max` over all `length[i]` in the `O(n²)` version.

## In the interview

- Present the `O(n²)` DP, then the tails optimisation with the "smaller tail is better" argument.
- Likely follow-ups:
  - *Return the subsequence?* Keep a parent pointer per element (in the `O(n²)` version, or by storing indices in `tails`).
  - *Number of LIS?* Track counts alongside lengths in the `O(n²)` DP.
  - *Russian doll envelopes?* Sort by width ascending and height descending, then LIS on heights.
