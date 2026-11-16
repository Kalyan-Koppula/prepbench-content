**Key insight:** equal halves means some subset sums to exactly `total / 2` — a 0/1 subset-sum feasibility check over a small range of sums.

## Approach

1. If `total` is odd, return `false`. Otherwise `target = total / 2`.
2. 2-D form first:
   - **State:** `can[i][s]` = some subset of the first `i` numbers sums to `s`.
   - **Recurrence:** `can[i][s] = can[i-1][s] OR (s >= x AND can[i-1][s - x])` where `x = nums[i-1]` — skip it or take it.
   - **Base cases:** `can[0][0] = true`, `can[0][s > 0] = false`.
   - **Order:** `i` increasing; any order of `s` within a row.
3. **Space optimisation:** row `i` reads only row `i - 1`, so use one array `reach[s]` and sweep `s` from `target` **down** to `x`. Going downward means `reach[s - x]` hasn't been updated for `x` yet, so each number is used at most once.
4. Return early once `reach[target]` turns true.

Progression: take/skip recursion is `O(2ⁿ)`; memoise on `(i, remaining)`; tabulate as `can[i][s]`; collapse to one row.

## Complexity

- Time `O(n · target)` — at most 200 × 10,000 = 2·10⁶ updates.
- Space `O(target)`.

## Alternatives to mention

- A `Set` of reachable sums — simple, same bound, slower constants.
- Bitset trick: `bits |= bits << x` with a `BigInt`, then test bit `target`. Very fast in languages with native bitsets.

## Pitfalls

- Sweeping `s` **upward** in the 1-D array reuses a number (that is unbounded knapsack): on `[2, 3, 7]` the single `2` marks 2, 4 and 6, wrongly returning `true`.
- Forgetting the odd-total check, or comparing against `total` instead of `total / 2`.
- It's pseudo-polynomial: fine because values are capped at 100.
