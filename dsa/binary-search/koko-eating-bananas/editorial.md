**Key idea:** if Koko can finish at speed `k`, she can finish at any faster speed. So "finishes in time" is **false, false, …, false, true, true, …** as the speed increases, and the answer is the first `true`. Binary search over speeds from 1 to the largest pile, checking each candidate by computing the hours it needs.

## Recognising the pattern

"Find the **smallest** value that satisfies a condition", where checking a given value is easy and the condition is monotone, is **binary search on the answer** from the [Binary Search](/problems/patterns/binary-search) sheet. You don't search an array; you search the range of possible answers.

## Brute force

Try speeds upward, starting from `ceil(total / h)` (anything slower can't eat everything even with no wasted time), and return the first speed whose hours fit. That is the reference brute force below.

Correct because it returns the first speed that works. Each check is `O(n)`, and the number of speeds tried can be up to the largest pile, so time is `O(n · max)` in the worst case. Space `O(1)`.

## Optimal: binary search on the speed

**Hours at speed `k`:** each pile takes `ceil(pile / k)` hours, since she can't move to another pile within the same hour. Sum over the piles.

**Range:** at speed `max(piles)` every pile takes one hour, and `h >= piles.length`, so it always works. Faster speeds never help. Speed 1 is the slowest possible. The answer is in `[1, max(piles)]`.

1. `lo = 1`, `hi = max(piles)`.
2. While `lo < hi`:
   1. `mid = lo + floor((hi − lo) / 2)`.
   2. If `hoursAt(mid) <= h`, `mid` works and maybe a slower speed does too: `hi = mid`.
   3. Otherwise `mid` is too slow: `lo = mid + 1`.
3. Return `lo`.

The loop maintains: the smallest working speed is in `[lo, hi]`. It ends when one candidate remains.

## Walkthrough

`piles = [3, 6, 7, 11]`, `h = 8`, so the range is `[1, 11]`.

| lo | hi | mid | hours at mid (per pile) | total | fits? | next |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 11 | 6 | 1 + 1 + 2 + 2 | 6 | yes | hi = 6 |
| 1 | 6 | 3 | 1 + 2 + 3 + 4 | 10 | no | lo = 4 |
| 4 | 6 | 5 | 1 + 2 + 2 + 3 | 8 | yes | hi = 5 |
| 4 | 5 | 4 | 1 + 2 + 2 + 3 | 8 | yes | hi = 4 |

Answer `4`.

## Complexity

- Linear scan of speeds: time `O(n · max)`, space `O(1)`.
- Binary search: time `O(n log max)`, about 30 checks of `n` piles for `max = 10^9`. Space `O(1)`.

## Edge cases

- `h` equal to the number of piles: she needs one pile per hour, so the answer is the largest pile.
- Very large `h`: the answer can be 1.
- A single pile: `ceil(pile / h)`.
- Large values: the hours sum can reach about `10^13`. Fine in JavaScript; in Java or C++ use a 64-bit integer, or stop summing once it exceeds `h`.

## Common mistakes

- Using `floor` instead of `ceil` for the hours per pile.
- Starting `lo` at 0 and dividing by zero.
- Setting `hi = mid − 1` when `mid` works, which can skip the answer.
- Overflow of the hours total in 32-bit languages.

## In the interview

- Say the monotonicity out loud: "faster always works if slower works, so the answers form a true/false boundary."
- Separate the check function from the search; it keeps the code clear.
- Likely follow-ups:
  - *Minimum days to ship packages with a capacity limit?* Same template, different check (Capacity to Ship Packages).
  - *Split an array into `k` parts minimising the largest sum?* Same template (Split Array Largest Sum).
  - *Speeds can be fractional?* Binary search on real numbers for a fixed number of iterations.
