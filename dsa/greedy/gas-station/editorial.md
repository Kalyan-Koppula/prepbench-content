**Key idea:** two facts. First, if the total gas is less than the total cost, no start works. Second, if you start at `s` and run dry on the way to `i + 1`, then **no** station between `s` and `i` can be the start either, so jump straight to `i + 1`. One pass finds the only candidate.

## Recognising the pattern

A circular route with a running balance that must never go negative, and a single valid answer, is a classic greedy with a proof by elimination, in the [Greedy](/problems/patterns/greedy) sheet. The same "reset when the running sum drops below zero" move appears in [Maximum Subarray](/problems/maximum-subarray).

## Brute force

Try every start, drive all the way round, and stop early when the tank goes negative. That is the reference brute force below. `O(n²)` time, `O(1)` space.

## One-pass elimination

1. `total = 0`, `tank = 0`, `start = 0`.
2. For each station `i`, with `diff = gas[i] − cost[i]`:
   1. `total += diff`, `tank += diff`.
   2. If `tank < 0`: set `start = i + 1` and `tank = 0`.
3. Return `start` if `total ≥ 0`, otherwise −1.

**Why skipping is safe.** Suppose you start at `s` and the tank first goes negative after station `i`. Every intermediate station `k` between `s` and `i` was reached with a tank of at least 0. Starting at `k` instead means arriving there with 0, which is no better, so you would run dry by station `i` too.

**Why the final candidate works when `total ≥ 0`.** From `start` to the end of the array, the tank never goes negative. The part before `start` has a negative sum (that is why it was skipped), so the part from `start` onward has at least that much surplus, enough to cover the wrap-around.

## Walkthrough

`gas = [2, 5, 1, 4]`, `cost = [3, 2, 5, 1]`, so `diff = [−1, 3, −4, 3]`.

| i | diff | tank before reset | action | start | total |
| --- | --- | --- | --- | --- | --- |
| 0 | −1 | −1 | reset | 1 | −1 |
| 1 | 3 | 3 | – | 1 | 2 |
| 2 | −4 | −1 | reset | 3 | −2 |
| 3 | 3 | 3 | – | 3 | 1 |

`total = 1 ≥ 0`, answer `3`. Starting there, the tank reads 3, 2, 5, 1 after each leg.

## Complexity

- Every start simulated: `O(n²)` time.
- One pass: `O(n)` time, `O(1)` space.

## Edge cases

- One station: valid if `gas ≥ cost`.
- Total exactly 0: still a valid start (the tank ends at 0).
- Total negative: −1, even if some stretches look good.

## Common mistakes

- Returning `start` without checking `total`.
- Resetting `start` to `i` instead of `i + 1`.
- Simulating the wrap-around explicitly with a second loop; it isn't needed.

## In the interview

- Give both proofs (skip and wrap-around); interviewers want the reasoning, not just the code.
- Likely follow-ups:
  - *Return every valid start?* Under this problem's guarantee there is at most one; in general, use prefix sums and check each start in `O(1)` with a minimum over a circular window.
  - *Minimum extra fuel to make some start work?* `max(0, −total)`.
