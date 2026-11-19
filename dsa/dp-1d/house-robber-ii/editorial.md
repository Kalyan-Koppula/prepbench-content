**Key idea:** in a circle, the first and last houses are neighbours, so at most one of them can be robbed. That splits the problem into two straight rows: houses `0..n−2` (the last one excluded) and houses `1..n−1` (the first one excluded). Solve ordinary House Robber on each and take the larger result.

## Recognising the pattern

A circular constraint on a linear DP is handled in the [1-D Dynamic Programming](/problems/patterns/dp-1d) sheet by **breaking the circle**: decide the one choice that wraps around, and solve the remaining straight problem for each case.

## Brute force

The reference brute force below runs the slower `O(n²)` "last robbed house" DP on both straight rows. Same split, slower inner solver.

## Two straight rows

1. If there is one house, return its cash.
2. `a` = House Robber on `nums[0..n−2]`; `b` = House Robber on `nums[1..n−1]`.
3. Return `max(a, b)`.

**Why this covers every valid plan.** A valid plan can't rob both the first and the last house. So it either leaves the last house alone (a plan for row `0..n−2`) or leaves the first house alone (a plan for row `1..n−1`), and possibly both. Each case's best is found by the straight solver.

## Walkthrough

`nums = [2, 3, 2]`

| row | houses | best |
| --- | --- | --- |
| without last | [2, 3] | 3 |
| without first | [3, 2] | 3 |

Answer `3`. Robbing both 2s is not allowed: they are neighbours in the circle.

For `nums = [1, 2, 3, 1]`: without last `[1, 2, 3]` gives 4, without first `[2, 3, 1]` gives 3, so the answer is `4`.

## Complexity

- Time `O(n)`: two linear passes. Space `O(1)`.
- With the `O(n²)` solver: time `O(n²)`.

## Edge cases

- One house: the special case above (both rows would be empty).
- Two houses: the larger one.
- Three houses: they are all neighbours of each other, so the answer is the largest one.

## Common mistakes

- Running House Robber on the whole circle.
- Excluding both the first and the last house, which misses plans that use one of them.
- Forgetting the single-house case.

## In the interview

- Explain the split before writing code; it reuses House Robber unchanged.
- Likely follow-ups:
  - *Other circular DPs?* The same trick: fix the wrap-around choice and solve linearly for each option.
  - *Houses on a tree?* Return (robbed, not robbed) per subtree.
