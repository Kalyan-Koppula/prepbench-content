**Key insight:** process items one at a time; for each capacity, the best plan either ignores the new item or takes it and fills the remaining capacity optimally with the earlier items.

## Approach

- **State:** `best[i][w]` = maximum value using only the first `i` items with total weight at most `w`.
- **Recurrence:** `best[i][w] = max(best[i-1][w], best[i-1][w - wt] + val)` — the second option only if `wt ≤ w` (`wt`, `val` belong to item `i - 1`).
- **Base cases:** `best[0][w] = 0` for every `w` (no items, no value); `best[i][0] = 0`.
- **Order:** items outer, capacity inner. Answer `best[n][capacity]`.
- **Space optimisation:** row `i` reads only row `i - 1`. With one array, sweep `w` from `capacity` **down** to `wt`: the cell `best[w - wt]` you read hasn't been overwritten for this item yet, so the item is used at most once.

Progression: take/skip recursion is `O(2ⁿ)`; memoise on `(i, remaining capacity)`; tabulate as `best[i][w]`; collapse to one row.

## Complexity

- Time `O(n · capacity)` — pseudo-polynomial (depends on the numeric capacity, not just `n`).
- Space `O(capacity)`.

## Alternatives to mention

- When capacity is huge but values are small, flip it: `lightest[v]` = least weight reaching value exactly `v`, then take the largest `v` with `lightest[v] ≤ capacity`. `O(n · Σvalues)`.
- **Fractional** knapsack (items divisible) is greedy by value/weight ratio — say why it doesn't apply here.
- Unbounded knapsack (unlimited copies): same one-row code with `w` swept **upward**.

## Pitfalls

- Upward sweep in the 1-D version silently turns it into unbounded knapsack.
- To recover which items were taken, you need the full 2-D table (or a per-item decision record) — the 1-D array loses it.
