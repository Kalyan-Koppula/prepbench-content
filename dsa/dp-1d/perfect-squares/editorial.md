**Key insight:** it's Coin Change with the squares `1, 4, 9, …` as coins — the last square used is some `k²`, and the rest must be made optimally.

## Approach

- **State:** `fewest[x]` = minimum number of squares summing to `x`.
- **Recurrence:** `fewest[x] = 1 + min over k ≥ 1 with k² ≤ x of fewest[x - k²]`.
- **Base case:** `fewest[0] = 0`. (`1` is a square, so every `x` is reachable — no `-1` case.)
- **Order:** `x = 1 … n` so smaller amounts are final.
- **Space:** the full table is needed; `fewest[x]` reads up to `√x` scattered earlier entries.

Progression: recursion "subtract any square and recurse" is exponential; memoise on the remainder; tabulate bottom-up as above.

## Complexity

- Time `O(n√n)` — `√x` options for each `x`. About 670k steps at `n = 10⁴`.
- Space `O(n)`.

## Alternatives to mention

- **BFS** from `n`, subtracting squares level by level; the first level to hit `0` is the answer. Often faster since the depth is at most 4.
- **Math:** by Lagrange's four-square theorem the answer is ≤ 4. It is `1` if `n` is a square, `2` if `n - a²` is a square for some `a`, `4` exactly when `n = 4^k(8m + 7)` (Legendre), otherwise `3`. `O(√n)` — a strong follow-up answer, but lead with the DP.

## Pitfalls

- Greedy (largest square first) fails: `12 = 9 + 1 + 1 + 1` (4) vs `4 + 4 + 4` (3).
- Initialising the table with `0` instead of `Infinity` makes every `min` return `1`.
