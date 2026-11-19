**Key idea:** run Bellman-Ford for exactly `k + 1` rounds. After round `i`, each city's price is the cheapest way to reach it using at most `i` flights. Each round must relax edges using **last round's** prices, so that a single round never chains two flights together.

## Recognising the pattern

A shortest path with a limit on the **number of edges** breaks plain Dijkstra, which happily takes a cheaper route with too many stops. The [Advanced Graphs](/problems/patterns/advanced-graphs) sheet's answer is Bellman-Ford limited by rounds, or Dijkstra over `(city, flights used)` states.

## Brute force

DFS over every route with at most `k + 1` flights, keeping the cheapest that reaches `dst`, with pruning when a route is already more expensive than the best found or than an earlier route that reached the same city with the same number of flights. That is the reference brute force below. Without pruning it is exponential.

## Bellman-Ford with k + 1 rounds

1. `price` = all ∞, `price[src] = 0`.
2. Repeat `k + 1` times:
   1. `next = copy of price`.
   2. For each flight `[from, to, cost]`: if `price[from] + cost < next[to]`, set `next[to]`.
   3. `price = next`.
3. Return `price[dst]`, or −1 if it is ∞.

**Why the copy.** If you updated `price` in place, a flight relaxed early in a round could feed a flight relaxed later in the same round, using two flights in one round and breaking the stop limit.

## Walkthrough

`n = 4`, `flights = [[0,1,100], [1,2,100], [2,0,100], [1,3,600], [2,3,200]]`, `src = 0`, `dst = 3`, `k = 1`

| round | prices (0, 1, 2, 3) | flights allowed |
| --- | --- | --- |
| start | 0, ∞, ∞, ∞ | 0 |
| 1 | 0, 100, ∞, ∞ | 1 |
| 2 | 0, 100, 200, 700 | 2 |

Answer `700` (`0 → 1 → 3`). The cheaper route `0 → 1 → 2 → 3` costs 400 but needs 2 stops.

## Complexity

- DFS: exponential in the worst case, much less with pruning.
- Bellman-Ford with `k + 1` rounds: time `O(k · E)`, space `O(n)`.
- Dijkstra over `(city, stops)`: time `O(k · E · log(k · n))`.

## Edge cases

- `src == dst`: price 0.
- No route within `k` stops: −1, even if a longer route exists.
- `k = 0`: only direct flights.

## Common mistakes

- Plain Dijkstra on cities, which ignores the stop limit.
- Relaxing in place within a round.
- Running `k` rounds instead of `k + 1` (stops are cities in between; flights are one more).

## In the interview

- Explain why Dijkstra alone fails here with a small counter-example, then present the rounds.
- Likely follow-ups:
  - *Return the route?* Track the previous city per round.
  - *Very large `k`?* It becomes ordinary shortest path: Dijkstra.
