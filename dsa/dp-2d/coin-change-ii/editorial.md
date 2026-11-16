**Key insight:** to count *combinations* rather than orderings, decide coin types one at a time: for each coin, either you never use it, or you use it at least once (and may use it again).

## Approach

- **State:** `ways[i][x]` = number of combinations summing to `x` using only the first `i` coin types.
- **Recurrence:** `ways[i][x] = ways[i - 1][x] + ways[i][x - c]` where `c = coins[i - 1]` (second term only if `x ≥ c`). The first term skips coin `i`; the second uses one more of it and stays on row `i` so it can be used again.
- **Base cases:** `ways[i][0] = 1` (the empty combination) for every `i`; `ways[0][x > 0] = 0`.
- **Order:** coins outer, amounts inner, increasing.
- **Space optimisation:** row `i` reads row `i - 1` at the same `x` (the not-yet-updated value) and row `i` at `x - c` (already updated). One array swept **upward** gives exactly that: `ways[x] += ways[x - c]`.

Progression: recursion `count(i, rest)` choosing "skip coin i" or "use coin i again" is exponential; memoise on `(i, rest)`; tabulate as `ways[i][x]`; collapse to one row.

## Complexity

- Time `O(amount · k)` for `k` coin types.
- Space `O(amount)`.

## Pitfalls

- **Loop order matters.** Amounts outer / coins inner counts *ordered sequences* (`1+2` and `2+1` separately) — that's Combination Sum IV, a different problem.
- Sweeping amounts downward makes each coin usable at most once (0/1 knapsack).
- `ways[0] = 1`, not `0`: the empty combination is what seeds every count. This also makes `amount = 0` return `1`.

## Alternatives to mention

- Compare with Coin Change I: same table shape, but `min` + `1` instead of `+`, and there loop order doesn't matter.
