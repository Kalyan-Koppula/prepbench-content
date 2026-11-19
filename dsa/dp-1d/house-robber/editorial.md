**Key idea:** for each house you either skip it, keeping the best total from the houses before it, or rob it, adding its cash to the best total from the houses **two** back. `best(i) = max(best(i − 1), best(i − 2) + nums[i])`. Two running variables are enough.

## Recognising the pattern

Choose items in a row to maximise a total, with a rule forbidding neighbours: the take-or-skip recurrence from the [1-D Dynamic Programming](/problems/patterns/dp-1d) sheet. The no-neighbours rule is exactly why the "take" branch looks two steps back.

## Brute force

Trying every subset of houses with no two neighbours is exponential. The reference brute force below is a slower DP: `endAt[i]` is the best total whose last robbed house is `i`, computed by scanning every earlier house at least two back. `O(n²)`.

## Bottom-up with two variables

1. `twoBack = 0`, `oneBack = 0` (the best over no houses).
2. For each house: `current = max(oneBack, twoBack + nums[i])`; shift `twoBack = oneBack`, `oneBack = current`.
3. Return `oneBack`.

**Why the recurrence covers every plan.** The best plan for houses `0..i` either robs house `i` or doesn't. If it doesn't, it is the best plan for `0..i−1`. If it does, house `i − 1` is untouched, and the rest must be the best plan for `0..i−2`.

## Walkthrough

`nums = [2, 7, 9, 3, 1]`

| house | cash | skip (oneBack) | rob (twoBack + cash) | best |
| --- | --- | --- | --- | --- |
| 0 | 2 | 0 | 2 | 2 |
| 1 | 7 | 2 | 7 | 7 |
| 2 | 9 | 7 | 11 | 11 |
| 3 | 3 | 11 | 10 | 11 |
| 4 | 1 | 11 | 12 | 12 |

Answer `12`: houses 0, 2 and 4.

## Complexity

- Subsets: `O(2^n)`.
- Last-robbed DP: time `O(n²)`, space `O(n)`.
- Two variables: time `O(n)`, space `O(1)`.

## Edge cases

- One house: rob it.
- Two houses: the larger one.
- All zeros: 0.

## Common mistakes

- Greedily taking every other house (even or odd positions), which fails on inputs like `[2, 1, 1, 2]`.
- Forgetting that the best plan may skip two houses in a row.
- Updating `twoBack` and `oneBack` in the wrong order.

## In the interview

- Explain the take-or-skip choice in one sentence, then show the two-variable version.
- Likely follow-ups:
  - *Houses in a circle?* Solve twice, without the first house and without the last (House Robber II).
  - *Houses on a binary tree?* Return two values per node, robbed and not robbed (House Robber III).
  - *Return the chosen houses?* Keep the full table and walk back.
