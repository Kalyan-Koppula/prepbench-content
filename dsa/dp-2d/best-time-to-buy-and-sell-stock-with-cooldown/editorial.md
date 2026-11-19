**Key idea:** at the end of each day you are in one of three states: **holding** a share, **just sold** (so tomorrow is a forced rest), or **resting** with nothing and free to buy. Track the best profit for each state, and compute today's three values from yesterday's three. The answer is the better of the two states that hold no share at the end.

## Recognising the pattern

"At each step you are in one of a few modes, and the rules depend on the mode" is the state-machine DP from the [2-D Dynamic Programming](/problems/patterns/dp-2d) sheet: the table is `day × state`, and with only three states it collapses to three variables.

```
         buy                sell
resting ─────▶ holding ─────────▶ justSold
  ▲  ⟲           ⟲                   │
  └──────────────────────────────────┘
               (cooldown day)
```

## Alternative: O(n²) over trades (shown below)

`best[i]` = most profit from days `i…` when you may buy on day `i`. Either do nothing today (`best[i + 1]`), or buy today and sell on some later day `j`, then continue from day `j + 2`, skipping the cooldown. That is the reference brute force below: `O(n²)` time, and a useful check on the state machine.

## Three-state DP

1. Day 0: `holding = −prices[0]`, `justSold = −∞` (impossible), `resting = 0`.
2. For each later day, from **yesterday's** values:
   - `holding = max(holding, resting − price)`: keep the share, or buy today. Buying is allowed only from `resting`, never straight after a sale.
   - `justSold = holding + price`: sell today.
   - `resting = max(resting, justSold)`: stay idle, or finish yesterday's cooldown.
3. Return `max(resting, justSold)`.

Save the old values before overwriting any of them; each new value must be computed from yesterday's.

## Walkthrough

`prices = [2, 5, 1, 4]`

| day | price | holding | justSold | resting |
| --- | --- | --- | --- | --- |
| 0 | 2 | −2 | −∞ | 0 |
| 1 | 5 | max(−2, 0 − 5) = −2 | −2 + 5 = 3 | max(0, −∞) = 0 |
| 2 | 1 | max(−2, 0 − 1) = −1 | −2 + 1 = −1 | max(0, 3) = 3 |
| 3 | 4 | max(−1, 3 − 4) = −1 | −1 + 4 = 3 | max(3, −1) = 3 |

Answer `max(3, 3) = 3`. Selling at 5 on day 1 forces a rest on day 2, so you can't also buy at 1; either trade alone gives 3.

## Complexity

- Trades over all pairs: `O(n²)` time, `O(n)` space.
- Three-state DP: `O(n)` time, `O(1)` space.

## Edge cases

- One day: 0.
- Falling prices: 0 (never buy).
- Rising prices: one long trade is as good as any split, since each split costs a cooldown day.

## Common mistakes

- Buying from `justSold` instead of `resting`, which ignores the cooldown.
- Updating the states in place, so today's `holding` feeds today's `justSold`.
- Starting `justSold` at 0, which pretends a sale happened before day 0.

## In the interview

- Draw the three states and their transitions before writing code.
- Likely follow-ups:
  - *A transaction fee instead of a cooldown?* Two states; subtract the fee on each sale.
  - *At most `k` transactions?* States `(transactions used, holding or not)`, `O(n · k)`.
  - *Unlimited trades, no cooldown?* Sum every positive day-to-day increase.
