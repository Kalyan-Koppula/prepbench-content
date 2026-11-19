**Key idea:** split the rule into its two directions. A left-to-right pass makes every child rated higher than their **left** neighbour get one more candy than that neighbour. A right-to-left pass does the same for the **right** neighbour, taking the larger of the two requirements so the first pass's work isn't undone. Each child ends up with the minimum that satisfies both sides.

## Recognising the pattern

A constraint between neighbours in both directions is hard to satisfy in one sweep, but easy as two one-directional sweeps. That is a two-pass greedy from the [Greedy](/problems/patterns/greedy) sheet, the same structure as Product of Array Except Self or Trapping Rain Water's left and right maxima.

## Brute force

Give everyone one candy, then repeatedly scan and fix any child who needs more than a neighbour, until nothing changes. That is the reference brute force below. Each pass is `O(n)`, and up to `n` passes may be needed, so `O(n²)`.

## Two passes

1. `given[i] = 1` for everyone.
2. Left to right: if `ratings[i] > ratings[i − 1]`, `given[i] = given[i − 1] + 1`.
3. Right to left: if `ratings[i] > ratings[i + 1]` and `given[i] ≤ given[i + 1]`, `given[i] = given[i + 1] + 1`.
4. Return the sum.

**Why each count is the minimum.** After the left pass, `given[i]` is the length of the increasing run ending at `i`, which any valid answer must give at least. The right pass raises it to the length of the decreasing run starting at `i` when that is larger. Both are lower bounds, and their maximum satisfies both rules, so it is optimal.

## Walkthrough

`ratings = [1, 2, 3, 1, 0]`

| i | rating | after left pass | after right pass |
| --- | --- | --- | --- |
| 0 | 1 | 1 | 1 |
| 1 | 2 | 2 | 2 |
| 2 | 3 | 3 | 3 (already more than 2) |
| 3 | 1 | 1 | 2 (must beat the 0) |
| 4 | 0 | 1 | 1 |

Total `1 + 2 + 3 + 2 + 1 = 9`.

## Complexity

- Repeat until stable: `O(n²)` time.
- Two passes: `O(n)` time, `O(n)` space.
- A one-pass `O(1)`-space method counts the lengths of rising and falling slopes; worth mentioning, rarely required.

## Edge cases

- One child: 1.
- Equal neighbours: no constraint between them; either can have fewer.
- Strictly decreasing ratings: `n, n − 1, …, 1`, total `n(n + 1)/2`.

## Common mistakes

- Giving equal-rated neighbours equal candy (not required, and it costs extra).
- In the right pass, overwriting with `given[i + 1] + 1` without taking the maximum, which breaks the left rule.
- Trying to satisfy both neighbours in one pass.

## In the interview

- Explain the two lower bounds (increasing run, decreasing run); the code then follows.
- Likely follow-ups:
  - *`O(1)` space?* Track the current up-slope and down-slope lengths and add their contributions as you go.
  - *Return the distribution itself?* Return `given` instead of its sum.
