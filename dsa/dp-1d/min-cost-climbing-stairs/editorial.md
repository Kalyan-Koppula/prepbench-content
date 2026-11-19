**Key idea:** let `dp[i]` be the cheapest way to **stand** on position `i`, with position `i`'s own fee not yet paid. You arrive from `i − 1` (paying its fee) or from `i − 2` (paying its fee): `dp[i] = min(dp[i − 1] + cost[i − 1], dp[i − 2] + cost[i − 2])`. Positions 0 and 1 are free starts, and the top is position `n`.

## Recognising the pattern

Climbing Stairs with a cost per step turns counting into minimising, a one-line change in the [1-D Dynamic Programming](/problems/patterns/dp-1d) sheet. Only the last two states are needed.

## Alternative: shortest path (shown below)

Treat positions as nodes and "pay the fee of step `i`, move one or two" as edges, then relax every edge repeatedly until nothing improves (Bellman-Ford). That is the reference brute force below: `O(n²)`. Correct, and it shows the DP is really a shortest path on a simple graph.

## Bottom-up with two variables

1. `twoBack = 0` (`dp[0]`), `oneBack = 0` (`dp[1]`): both are free starting points.
2. For `i` from 2 to `n`: `current = min(oneBack + cost[i − 1], twoBack + cost[i − 2])`; shift.
3. Return `oneBack`, which is `dp[n]`.

**Where the fee goes.** The fee of a step is paid when you **leave** it. Defining `dp[i]` without step `i`'s fee keeps the free starts simple (`dp[0] = dp[1] = 0`) and makes the top, which has no fee, the natural answer.

## Walkthrough

`cost = [10, 15, 20]`, top is position 3.

| i | from i − 1 | from i − 2 | dp[i] |
| --- | --- | --- | --- |
| 0 | – | – | 0 |
| 1 | – | – | 0 |
| 2 | 0 + 15 | 0 + 10 | 10 |
| 3 | 10 + 20 | 0 + 15 | 15 |

Answer `15`: start on step 1, pay 15, jump two to the top.

## Complexity

- Repeated relaxation: time `O(n²)`, space `O(n)`.
- Bottom-up: time `O(n)`, space `O(1)`.

## Edge cases

- Two steps: the answer is the cheaper of the two (start on it and jump to the top).
- Zero fees: answer 0.

## Common mistakes

- Treating the last step as the top (the top is one past it).
- Adding a step's fee when arriving instead of when leaving, then double-counting.
- Forgetting that both of the first two steps are free starting points.

## In the interview

- Be explicit about what `dp[i]` includes; most bugs here are about which fees are counted.
- Likely follow-ups:
  - *Return the path?* Record which choice was taken at each `i` and walk back from the top.
  - *Jumps of up to `k` steps?* Take the minimum over the last `k` states; a monotonic deque keeps it `O(n)`.
