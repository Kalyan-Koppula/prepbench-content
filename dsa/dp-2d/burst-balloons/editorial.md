**Key idea:** think about the **last** balloon to burst, not the first. Add a virtual balloon worth 1 at each end. If `k` is the last balloon burst between two walls `l` and `r`, then when it bursts, its neighbours are exactly `l` and `r`, worth `val[l] · val[k] · val[r]`, and the balloons on its left and right were burst independently. So `best[l][r] = max over k of best[l][k] + val[l] · val[k] · val[r] + best[k][r]`.

## Recognising the pattern

The answer for a range depends on how you split it, which is interval DP from the [2-D Dynamic Programming](/problems/patterns/dp-2d) sheet, alongside [Matrix Chain Multiplication](/problems/matrix-chain-multiplication). The trick is choosing the split so the two halves don't affect each other. Choosing the **first** balloon fails: after it bursts, its two neighbours become adjacent, so the halves interact.

## Alternative: the same recurrence top-down (shown below)

`bestBetween(l, r)` tries every `k` strictly between the walls and recurses on both sides, memoised on `(l, r)`. That is the reference brute force below. `O(n³)` like the table, but the order of computation is handled by the recursion. Trying every burst order directly is `O(n!)`.

## Interval table

1. `val = [1, ...nums, 1]`; `size = n + 2`.
2. `best[l][r] = 0` when `r − l < 2` (nothing strictly between).
3. For `gap` from 2 to `size − 1`, for each `l`, with `r = l + gap`:
   - For every `k` strictly between `l` and `r`: `best[l][r] = max(best[l][r], best[l][k] + val[l] · val[k] · val[r] + best[k][r])`.
4. Return `best[0][size − 1]`.

**Why by gap.** `best[l][r]` reads only narrower intervals, so filling by increasing width guarantees they are ready.

## Walkthrough

`nums = [1, 3, 2]` → `val = [1, 1, 3, 2, 1]` (indices 0–4; 0 and 4 are walls).

| interval (l, r) | candidates for k | best |
| --- | --- | --- |
| (0, 2) | k = 1: 1·1·3 = 3 | 3 |
| (1, 3) | k = 2: 1·3·2 = 6 | 6 |
| (2, 4) | k = 3: 3·2·1 = 6 | 6 |
| (0, 3) | k = 1: 0 + 2 + 6 = 8; k = 2: 3 + 6 + 0 = 9 | 9 |
| (1, 4) | k = 2: 0 + 3 + 6 = 9; k = 3: 6 + 2 + 0 = 8 | 9 |
| (0, 4) | k = 1: 1 + 9 = 10; k = 2: 3 + 3 + 6 = 12; k = 3: 9 + 2 = 11 | **12** |

Answer `12`: the 3 (`k = 2`) is burst last; before it, the 1 and the 2 are burst separately.

## Complexity

- Every burst order: `O(n!)`.
- Interval DP, top-down or bottom-up: `O(n³)` time, `O(n²)` space. With `n ≤ 300`, that is about 4.5 million inner steps.

## Edge cases

- One balloon: `1 · x · 1 = x`.
- Zeros: they contribute nothing; the DP handles them without special cases.
- All ones: each burst gives 1, total `n`.

## Common mistakes

- Choosing the first balloon to burst, which makes the subproblems depend on each other.
- Using inclusive intervals and getting confused about which neighbours apply; exclusive walls make it clean.
- Filling by `l` ascending instead of by width.

## In the interview

- Say why "last" works and "first" doesn't; that is the key insight the problem tests.
- Likely follow-ups:
  - *Return the burst order?* Store the best `k` per interval and replay recursively: both sides first, then `k`.
  - *Similar problems?* Matrix chain multiplication, minimum cost to cut a stick, optimal binary search trees.
