**Key insight:** model each day's end as a small state machine — *holding*, *just sold*, *free* — and carry the best profit for each state forward. The cooldown is just "you can't go from *just sold* straight to *holding*".

## Approach

- **State:** `dp[i][s]` = best profit at the end of day `i` while in state `s`:
  - `hold` — owning a share,
  - `sold` — sold on day `i` (so day `i + 1` is a rest day),
  - `free` — not owning, and free to buy tomorrow.
- **Recurrence (transitions):**
  - `hold[i] = max(hold[i-1], free[i-1] - prices[i])` — keep, or buy (only from `free`).
  - `sold[i] = hold[i-1] + prices[i]` — sell today.
  - `free[i] = max(free[i-1], sold[i-1])` — rest; yesterday's sale finishes cooling down.
- **Base cases (day 0):** `hold = -prices[0]`, `sold = -∞` (nothing to sell), `free = 0`.
- **Order:** day by day. Answer `max(free, sold)` on the last day — ending while holding is never optimal.
- **Space optimisation:** each day reads only the previous day, so three variables. Save the old `hold` before overwriting it, because `sold` needs yesterday's value.

Progression: recursion `f(day, holding)` branching on buy/sell/wait is exponential; memoise on `(day, holding)` → `O(n)` states; tabulate as above; three rolling variables.

## Complexity

- Time `O(n)`.
- Space `O(1)`.

## Alternatives to mention

- An `O(n²)` "pick the next sell day" DP: `best[i] = max(best[i+1], max over j>i of prices[j] - prices[i] + best[j+2])`. Correct, but too slow to lead with.

## Follow-ups

- Same state-machine template solves the whole stock family: transaction fee (subtract on sell), at most `k` transactions (add a `k` dimension), unlimited trades (two states).

## Pitfalls

- Allowing a buy from `sold` ignores the cooldown.
- Updating `hold` first and then using the new value to compute `sold` (selling on the day you bought — harmless here, but it's a bug pattern in the fee variant).
