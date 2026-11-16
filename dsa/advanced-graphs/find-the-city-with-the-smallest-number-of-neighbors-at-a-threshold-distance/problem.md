---
title: Find the City With the Smallest Number of Neighbors at a Threshold Distance
difficulty: Medium
order: 6
lists: [striver]
tags: [floyd-warshall, shortest-path]
leetcode: find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance
function: findTheCity
params:
  - { name: n, type: number }
  - { name: edges, type: "number[][]" }
  - { name: distanceThreshold, type: number }
returns: number
hints:
  - You need shortest distances from every city to every other city.
  - With `n <= 100`, Floyd–Warshall's `O(n³)` triple loop is the simplest way to get all of them.
  - Count reachable cities per row; break ties toward the larger label by scanning with `<=`.
complexity: { time: "O(n³)", space: "O(n²)" }
---

There are `n` cities labelled `0` to `n - 1`. Each entry `edges[i] = [u, v, w]` is a two-way road of length `w` between cities `u` and `v`.

For each city, count how many **other** cities can be reached from it by a route whose total length is at most `distanceThreshold`.

Return the city with the smallest such count. If several cities tie, return the one with the largest label.

## Constraints

- `2 <= n <= 100`
- `0 <= edges.length <= n · (n - 1) / 2`
- `edges[i] = [u, v, w]` with `0 <= u < v < n` and `1 <= w <= 10^4`
- Each pair of cities has at most one road.
- `1 <= distanceThreshold <= 10^4`
