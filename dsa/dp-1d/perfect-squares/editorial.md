**Key idea:** this is [Coin Change](/problems/coin-change) where the coins are the perfect squares `1, 4, 9, 16, …`. Let `fewest[x]` be the fewest squares summing to `x`; then `fewest[x] = 1 + min over k of fewest[x − k²]`. Fill from 1 up to `n`.

## Recognising the pattern

"Fewest items, each usable any number of times, to make an exact total" is unbounded knapsack from the [1-D Dynamic Programming](/problems/patterns/dp-1d) sheet. Greedy (largest square first) fails: for 12 it gives `9 + 1 + 1 + 1` (four squares), but `4 + 4 + 4` uses three.

## Alternative: BFS over remainders (shown below)

Start from `n`. One level of BFS subtracts one square in every possible way. The first level that reaches 0 is the fewest squares. A `seen` array stops each remainder from being queued twice. That is the reference brute force below. It is often faster in practice, because the answer is never more than 4, so BFS stops after at most four levels.

## Bottom-up table

1. `fewest[0] = 0`, every other entry ∞.
2. For `x` from 1 to `n`: for every `k` with `k² ≤ x`: `fewest[x] = min(fewest[x], fewest[x − k²] + 1)`.
3. Return `fewest[n]`. It is always finite, since `1` is a square.

## Walkthrough

`n = 12`

| x | squares tried (x − k²) | fewest[x] |
| --- | --- | --- |
| 1 | 0 | 1 |
| 2 | 1 | 2 |
| 3 | 2 | 3 |
| 4 | 3, **0** | 1 |
| 5 | 4, 1 | 2 |
| 8 | 7, **4** | 2 |
| 9 | 8, 5, **0** | 1 |
| 12 | 11, **8**, 3 | 3 |

`fewest[11] = 3` (9 + 1 + 1), `fewest[8] = 2`, `fewest[3] = 3`, so `fewest[12] = 2 + 1 = 3`: `4 + 4 + 4`.

## Complexity

- Table: `O(n √n)` time, `O(n)` space.
- BFS: `O(n √n)` in the worst case, usually much less, `O(n)` space.

## A mathematical shortcut

Lagrange's four-square theorem says every positive integer is a sum of at most four squares. Legendre's theorem says exactly four are needed only when `n` has the form `4^a (8b + 7)`. So the answer is 1 if `n` is a square, 2 if `n − k²` is a square for some `k`, 4 for that special form, and 3 otherwise: `O(√n)`. Worth mentioning; interviewers expect the DP.

## Edge cases

- `n` is itself a square: 1.
- `n = 7` (form `8b + 7`): 4.
- `n = 1`: 1.

## Common mistakes

- Greedy by the largest square.
- Looping `k` while `k ≤ x` instead of `k² ≤ x`.
- Recursing without memoisation.

## In the interview

- Name the reduction to coin change immediately; the code is the same.
- Likely follow-ups:
  - *Return the squares used?* Store the chosen `k` for each `x` and walk back.
  - *Faster?* BFS, or the number-theory shortcut above.
