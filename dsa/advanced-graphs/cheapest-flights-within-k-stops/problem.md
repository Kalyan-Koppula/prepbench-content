---
title: Cheapest Flights Within K Stops
difficulty: Medium
order: 4
lists: [neetcode150, striver]
tags: [bellman-ford, shortest-path, dynamic-programming]
leetcode: cheapest-flights-within-k-stops
function: findCheapestPrice
params:
  - { name: n, type: number }
  - { name: flights, type: "number[][]" }
  - { name: src, type: number }
  - { name: dst, type: number }
  - { name: k, type: number }
returns: number
hints:
  - At most `k` stops means at most `k + 1` flights. Which shortest-path algorithm naturally works in rounds of "one more edge"?
  - Run `k + 1` rounds of Bellman-Ford, but relax each round from a copy of the previous round's prices.
complexity: { time: "O(k · E)", space: "O(n)" }
---

There are `n` cities labelled `0` to `n - 1`. Each entry `flights[i] = [from, to, price]` is a one-way flight.

Return the cheapest total price to travel from `src` to `dst` using **at most `k` stops** (intermediate cities, so at most `k + 1` flights). Return `-1` if no such route exists.

## Constraints

- `1 <= n <= 100`
- `0 <= flights.length <= n · (n - 1) / 2`
- `flights[i] = [from, to, price]` with `0 <= from, to < n`, `from != to`, `1 <= price <= 10^4`
- No flight `(from, to)` appears twice.
- `0 <= src, dst, k < n`, `src != dst`
