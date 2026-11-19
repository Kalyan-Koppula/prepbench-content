**Key idea:** if you decide to sell today, the best buy day is simply the cheapest day before today. Keep that running minimum as you scan, and the answer is the largest `today - cheapest so far`.

## Recognising the pattern

You are choosing two days, a buy day and a later sell day, and you want the largest difference. It is a contiguous range problem in disguise: the trade spans the days from buy to sell. That puts it in the [Sliding Window](/problems/patterns/sliding-window) family, in its simplest form. The window is "from the cheapest day so far up to today", and the only thing you need to know about it is its minimum.

Checking every pair of days works but is quadratic, and with `10^5` days that is about 5 billion pairs. Too slow.

## Brute force

Try every buy day, and for each one every later sell day. Keep the largest profit, and start from `0` so that "don't trade" is the fallback when prices only fall.

It is correct because it literally checks every legal trade. Time `O(n²)`, space `O(1)`.

## Optimal: one pass with a running minimum

Look at what the brute force repeats. For a fixed sell day `j`, it scans every earlier day looking for the cheapest one. Then for sell day `j + 1` it scans all those days again, plus one more. The only new information at each step is a single extra price.

So flip the loops around. Fix the **sell** day instead of the buy day, and ask: which buy day is best for selling today? Always the cheapest day before today. If you remember that cheapest price as you go, each day needs only one comparison.

1. Set `minPrice = prices[0]` and `best = 0`.
2. For each later day:
   1. `profit = prices[day] - minPrice`. This is the best trade that sells today.
   2. If `profit > best`, update `best`.
   3. If today's price is lower than `minPrice`, update `minPrice`. Do this **after** computing the profit, so you never buy and sell on the same day.
3. Return `best`.

The invariant: at the start of each iteration, `minPrice` is the lowest price on days `0 .. day - 1`, and `best` is the best profit from any trade that sells before `day`.

## Walkthrough

`prices = [7, 1, 5, 3, 6, 4]`

| day | price | profit if sold today | best | minPrice after |
| --- | --- | --- | --- | --- |
| 0 | 7 | – | 0 | 7 |
| 1 | 1 | 1 − 7 = −6 | 0 | 1 |
| 2 | 5 | 5 − 1 = 4 | 4 | 1 |
| 3 | 3 | 3 − 1 = 2 | 4 | 1 |
| 4 | 6 | 6 − 1 = 5 | 5 | 1 |
| 5 | 4 | 4 − 1 = 3 | 5 | 1 |

Answer `5`: buy at 1 on day 1, sell at 6 on day 4. Notice that the minimum is found on day 1 and the best sell comes three days later. A "buy at the global min, sell at the global max" shortcut would fail on inputs where the max comes before the min, such as `[6, 1, 3]`.

## Complexity

- Brute force: time `O(n²)` for all pairs, space `O(1)`.
- Optimal: time `O(n)`, one pass with constant work per day. Space `O(1)`, just two numbers.

## Edge cases

- A single day: no trade is possible, so the loop doesn't run and the answer is `0`.
- Prices that only fall, like `[9, 7, 4, 3, 1]`: every profit is negative, so `best` stays `0`.
- All prices equal: profit is always `0`.
- The minimum is on the last day: it updates `minPrice` but no later day uses it, which is correct.

## Common mistakes

- Updating `minPrice` before computing today's profit. Today then counts as both buy and sell, which happens to give profit `0` here, but the same habit breaks variations that charge a fee.
- Returning `max(prices) - min(prices)`, which ignores the order of the days.
- Starting `best` at `-Infinity` or at the first difference, which returns a loss instead of `0` when prices only fall.

## In the interview

- Start by restating the rule: one buy, one later sell, and `0` if nothing is profitable.
- Mention the brute force in one sentence, then say: "For each sell day the best buy is the cheapest earlier day, so I keep a running minimum." That sentence is the whole solution.
- Likely follow-ups:
  - *Unlimited trades?* Add up every positive day-to-day increase (Best Time II).
  - *At most two trades, or `k` trades?* Dynamic programming over states like "holding" and "not holding" with a trade count.
  - *A cooldown day after selling, or a fee per trade?* Still state-machine DP, with one extra transition.
  - *Return the days, not the profit?* Remember the index of `minPrice` and the indices when `best` last improved.
