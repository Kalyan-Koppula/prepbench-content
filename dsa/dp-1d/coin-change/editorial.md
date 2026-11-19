**Key idea:** let `fewest[x]` be the smallest number of coins that make amount `x`. Whatever the best way to make `x` is, it has some last coin `c`, and the rest is the best way to make `x − c`. So `fewest[x] = min over coins of fewest[x − c] + 1`, filled from `x = 1` up to `amount`.

## Recognising the pattern

Minimising a count over an amount, with unlimited copies of each item, is the unbounded-knapsack shape in the [1-D Dynamic Programming](/problems/patterns/dp-1d) sheet. Greedy (always take the largest coin) fails for coin sets like `[1, 3, 4]` with amount 6.

## Alternative: BFS over amounts (shown below)

Each coin used moves you from one remaining amount to a smaller one. BFS from `amount` explores remaining amounts level by level, one coin per level; the first level that reaches 0 is the fewest coins. That is the reference brute force below. Same `O(amount × coins)` cost, and a nice illustration that this is a shortest path.

## Bottom-up table

1. `fewest` = all ∞, `fewest[0] = 0`.
2. For each `x` from 1 to `amount`, for each coin `c ≤ x`: `fewest[x] = min(fewest[x], fewest[x − c] + 1)`.
3. Return `fewest[amount]`, or −1 if it is still ∞.

Infinity marks amounts that can't be made; `∞ + 1` stays ∞, so impossible amounts never produce a valid count.

## Walkthrough

`coins = [1, 2, 5]`, `amount = 11`

| x | best last coin | fewest[x] |
| --- | --- | --- |
| 1 | 1 | 1 |
| 2 | 2 | 1 |
| 3 | 1 or 2 | 2 |
| 4 | 2 | 2 |
| 5 | 5 | 1 |
| 6 | 5 (+1) | 2 |
| 7 | 5 (+2) | 2 |
| 10 | 5 (+5) | 2 |
| 11 | 5 (+6) | 3 |

Answer `3` (5 + 5 + 1).

## Complexity

- Both approaches: time `O(amount × coins)`, space `O(amount)`.

## Edge cases

- `amount = 0`: 0 coins.
- No combination works, like `coins = [2]`, `amount = 3`: −1.
- Huge coin values (up to `2^31 − 1`): skipped by the `c ≤ x` check.

## Common mistakes

- Greedy by largest coin.
- Initialising with 0 instead of ∞, which makes impossible amounts look free.
- Returning ∞ instead of −1.

## In the interview

- Give the greedy counter-example, then the recurrence "what was the last coin?".
- Likely follow-ups:
  - *Number of ways instead of fewest coins (Coin Change II)?* Count combinations with coins in the **outer** loop, so different orders aren't counted separately.
  - *Limited copies of each coin?* Bounded knapsack.
  - *Return the coins used?* Store the last coin chosen for each amount and walk back.
