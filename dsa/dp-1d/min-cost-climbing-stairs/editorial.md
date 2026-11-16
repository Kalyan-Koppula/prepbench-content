**Key insight:** the cheapest way to reach position `i` comes from `i - 1` or `i - 2`, plus the fee of the step you left from — a Fibonacci-shaped min recurrence.

## Approach

- **State:** `dp[i]` = minimum total fee to stand on position `i` (its own fee not yet paid). Position `n = cost.length` is the top.
- **Recurrence:** `dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])`.
- **Base cases:** `dp[0] = dp[1] = 0` — you may start on either for free.
- **Order:** `i = 2 … n`, left to right. Answer `dp[n]`.
- **Space optimisation:** `dp[i]` reads only the previous two entries, so two rolling variables suffice.

Progression: recursion `f(i) = cost[i] + min(f(i + 1), f(i + 2))` is exponential; memoise it, flip it bottom-up, then keep two variables.

## Complexity

- Time `O(n)` — one pass.
- Space `O(1)`.

## Pitfalls

- The top is **past** the last step, not the last step itself — answering `dp[n - 1]` skips the final climb.
- The "pay on arrival" formulation also works but shifts the indices; pick one definition and stick to it.
- Both starting steps are free: forgetting `dp[1] = 0` forces every path through step `0`.
