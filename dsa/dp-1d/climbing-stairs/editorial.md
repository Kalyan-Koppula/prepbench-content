**Key idea:** your last move onto step `n` was either a 1-step from `n − 1` or a 2-step from `n − 2`, so `ways(n) = ways(n − 1) + ways(n − 2)`, with `ways(0) = ways(1) = 1`. Fill it in from the bottom up, keeping only the last two values.

## Recognising the pattern

"How many ways", where each way ends with one of a few choices, is the starting point of the [1-D Dynamic Programming](/problems/patterns/dp-1d) sheet. The recurrence is the Fibonacci sequence.

## Brute force

Plain recursion on the recurrence recomputes the same subproblems over and over: `ways(n − 2)` is computed inside both `ways(n)` and `ways(n − 1)`. The number of calls grows like `1.6^n`, and for `n = 45` that is over a billion calls.

## Alternative: counting directly (shown below)

A sequence with `k` two-steps has `n − k` moves, and the two-steps can occupy any `k` of those positions: `C(n − k, k)` ways. Summing over `k` gives the answer. That is the reference brute force below: `O(n²)` arithmetic and a nice cross-check, but it doesn't generalise the way the recurrence does.

## Bottom-up with two variables

1. `twoBack = 1` (ways to reach step 0), `oneBack = 1` (step 1).
2. For `i` from 2 to `n`: `current = oneBack + twoBack`; shift: `twoBack = oneBack`, `oneBack = current`.
3. Return `oneBack`.

**Why `ways(0) = 1`.** There is exactly one way to be at the bottom: make no moves. With it, `ways(2) = ways(1) + ways(0) = 2`, which matches `1+1` and `2`.

## Walkthrough

`n = 5`

| i | twoBack | oneBack | current |
| --- | --- | --- | --- |
| start | 1 | 1 | |
| 2 | 1 | 1 | 2 |
| 3 | 1 | 2 | 3 |
| 4 | 2 | 3 | 5 |
| 5 | 3 | 5 | 8 |

Answer `8`.

## Complexity

- Plain recursion: time `O(1.6^n)`, space `O(n)` stack.
- Counting with binomials: time `O(n²)`, space `O(1)`.
- Bottom-up: time `O(n)`, space `O(1)`.

## Edge cases

- `n = 1`: 1 way. `n = 2`: 2 ways.
- `n = 45`: about 1.8 billion, which still fits in a 32-bit signed integer.

## Common mistakes

- `ways(0) = 0`, which makes every answer wrong.
- Using recursion without memoisation.
- Off-by-one in the loop bounds.

## In the interview

- Derive the recurrence from "what was the last move?". That question is the general DP technique.
- Likely follow-ups:
  - *Steps of size 1, 2 or 3?* Add a third term.
  - *Any step size from a set?* `ways(n) = Σ ways(n − s)`, the coin-change counting pattern.
  - *Very large `n`, answer modulo a prime?* Matrix exponentiation in `O(log n)`.
