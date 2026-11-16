---
title: 2-D Dynamic Programming
order: 15
summary: When one index can't describe the subproblem, use two — grid cells, two prefixes, item × capacity, or an interval.
---

## Recognise it

- **Grid DP:** move right/down (or similar) through a matrix; count paths or minimise cost.
- **Two sequences:** compare / align / match strings `a` and `b` — LCS, edit distance, interleaving, regex.
- **Knapsack family:** pick items under a capacity or hit a target sum; "each item once" (0/1) vs "unlimited" (unbounded).
- **Interval DP:** the answer for `[i, j]` depends on how you split it — burst balloons, matrix-chain, palindromes.
- **State machine:** at each step you're in one of a few modes (holding / not holding / cooling down).

## The recipe

1. **State:** `dp[i][j]` in one sentence — "the answer for the first `i` of `a` and first `j` of `b`", "for cell `(i, j)`", "for items `0..i` with capacity `j`", "for the interval `[i, j]`".
2. **Recurrence:** enumerate the last decision (match / skip a char, take / skip item, which split point `k`).
3. **Base cases:** the empty-prefix row and column, the first row/column of a grid, intervals of length 0/1.
4. **Order:** every cell you read must be filled first — row by row for prefixes, by **length** for intervals.
5. **Space:** if row `i` only reads row `i - 1`, keep one or two rows.

## Templates

```ts
// Two-sequence prefix DP with a padded row/column for empty prefixes.
const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
for (let i = 1; i <= m; i++)
  for (let j = 1; j <= n; j++)
    dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])

// Interval DP: fill by increasing length so sub-intervals are ready.
for (let len = 2; len <= n; len++)
  for (let i = 0; i + len - 1 < n; i++) {
    const j = i + len - 1
    for (let k = i; k < j; k++) dp[i][j] = Math.min(dp[i][j], dp[i][k] + dp[k + 1][j] + cost(i, k, j))
  }
```

## Interview notes

- Derive it out loud: brute recursion on `(i, j)` → memoise → tabulate → shrink to one row.
- Pad with an extra row/column for "empty prefix" — it removes most edge-case `if`s.
- 0/1 knapsack in one row: iterate capacity **downward**; unbounded: **upward**.
- Counting combinations (order doesn't matter): loop items outside, amounts inside. Swap them and you count ordered sequences.
- Grid problems with moves in all four directions are not a plain table — use DFS + memo (needs a DAG, e.g. strictly increasing paths).

## Pitfalls

- Off-by-one between `dp` indices (prefix lengths) and string indices (`a[i - 1]`).
- Rolling a 2-D table into 1-D: you may need to save the old `dp[j - 1]` (the diagonal) before overwriting it.
- Interval DP filled row by row instead of by length reads unfilled cells.
- Using `0` as "impossible" in min-DP; use `Infinity` (and `-Infinity` for max).
