---
title: Network Delay Time
difficulty: Medium
order: 1
lists: [neetcode150, striver]
tags: [dijkstra, heap, shortest-path]
leetcode: network-delay-time
function: networkDelayTime
params:
  - { name: times, type: "number[][]" }
  - { name: n, type: number }
  - { name: k, type: number }
returns: number
hints:
  - Every node receives the signal at its shortest-path distance from `k`. The answer is the largest of those distances.
  - Weights are non-negative, so Dijkstra applies. Use a min-heap keyed on distance.
complexity: { time: "O(E log V)", space: "O(V + E)" }
---

A network has `n` nodes labelled `1` to `n`. Each entry `times[i] = [u, v, w]` is a **directed** link: a signal sent from `u` arrives at `v` after `w` time units.

A signal is broadcast from node `k` at time `0` and travels along every link. Return the time at which the last node receives it, or `-1` if some node never does.

## Constraints

- `1 <= n <= 100`
- `0 <= times.length <= 6000`
- `times[i] = [u, v, w]` with `1 <= u, v <= n`, `u != v`, `0 <= w <= 100`
- No pair `(u, v)` appears twice.
- `1 <= k <= n`
