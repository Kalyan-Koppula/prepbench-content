---
title: K Closest Points to Origin
difficulty: Medium
order: 3
lists: [neetcode150]
tags: [heap, top-k, geometry]
leetcode: k-closest-points-to-origin
function: kClosest
params:
  - { name: points, type: "number[][]" }
  - { name: k, type: number }
returns: "number[][]"
compare: unordered
hints:
  - Comparing squared distances `x² + y²` gives the same order as real distances — no square roots needed.
  - Keep a max-heap of the `k` best points so far; when it overflows, drop the farthest.
complexity: { time: "O(n log k)", space: "O(k)" }
---

You're given a list of points on a plane, `points[i] = [x, y]`, and an integer `k`. Return the `k` points nearest to the origin `(0, 0)` by ordinary Euclidean distance.

The answer may be listed in any order. Inputs are chosen so the set of `k` nearest points is unique (the k-th nearest is strictly closer than the next one).

## Constraints

- `1 <= k <= points.length <= 10^4`
- `-10^4 <= x, y <= 10^4`
- The `k` nearest points are uniquely determined.
