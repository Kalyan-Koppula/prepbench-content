**Key idea:** count combinations, not orderings, by deciding about the coin types **one at a time**. Let `ways[i][x]` be the number of ways to make `x` using only the first `i` coin types. Either you use no more of coin `i` (`ways[i − 1][x]`), or you use one more copy of it and stay on the same row so it can be used again (`ways[i][x − coin]`).

## Recognising the pattern

"How many ways to make an amount with unlimited copies of each coin" is the counting version of unbounded knapsack, in the [2-D Dynamic Programming](/problems/patterns/dp-2d) sheet. The trap is that `2 + 1` and `1 + 2` are the same combination. Fixing the order in which coin types are considered is what stops them being counted twice.

## Alternative: choose a count for each coin (shown below)

`countWays(i, rest)`: for coin `i`, try using it 0, 1, 2, … times, and for each choice count the ways to make the rest with the coins after it. Each combination is generated exactly once, because the coins are decided in a fixed order. With memoisation on `(i, rest)` this is the reference brute force below: `O(coins × amount²/coin)` in the worst case, slower than the table but clearly correct.

## Table over coin types and amounts

1. `ways[i][0] = 1` for every `i`: the empty combination makes 0.
2. For each coin type `i` from 1 to `n`, for `x` from 1 to `amount`:
   - `ways[i][x] = ways[i − 1][x]`, plus `ways[i][x − coin]` if `coin ≤ x`.
3. Return `ways[n][amount]`.

**One row is enough.** Row `i` reads row `i − 1` at the same column and row `i` to the left. With a single array updated from left to right, `ways[x]` holds the previous row's value before the update and `ways[x − coin]` already holds the current row's. That is the familiar loop: coins outside, amounts inside, ascending.

**The loop order matters.** Amounts outside and coins inside counts **orderings**: `1 + 2` and `2 + 1` become different. That is a different problem (Combination Sum IV).

## Walkthrough

`amount = 6`, `coins = [1, 2, 3]`

| coins allowed | x = 0 | 1 | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| {1} | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| {1, 2} | 1 | 1 | 2 | 2 | 3 | 3 | 4 |
| {1, 2, 3} | 1 | 1 | 2 | 3 | 4 | 5 | 7 |

For example `ways[{1,2,3}][6] = ways[{1,2}][6] + ways[{1,2,3}][3] = 4 + 3 = 7`. Answer `7`.

## Complexity

- Choose a count per coin, memoised: up to `O(n × amount²)`.
- Table: `O(n × amount)` time; `O(n × amount)` space, or `O(amount)` with one row.

## Edge cases

- `amount = 0`: 1 way (use nothing), even with no usable coins.
- No combination possible (`7` with `[2, 4]`): 0.
- A coin larger than the amount: contributes nothing.

## Common mistakes

- Amounts in the outer loop, which counts permutations.
- `ways[0] = 0`, which makes every count 0.
- Iterating amounts downward in the one-row version, which allows each coin only once.

## In the interview

- Explain why the coin order prevents double counting; it is the whole problem.
- Likely follow-ups:
  - *Count orderings instead (Combination Sum IV)?* Swap the loops.
  - *Each coin at most once?* Use the previous row on both sides, or iterate the one-row version downward.
  - *Fewest coins?* [Coin Change](/problems/coin-change), with `min` instead of `+`.
