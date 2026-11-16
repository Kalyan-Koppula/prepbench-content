---
title: Swim in Rising Water
difficulty: Hard
order: 9
lists: [neetcode150]
tags: [dijkstra, heap, matrix, binary-search, union-find]
leetcode: swim-in-rising-water
function: swimInWater
params:
  - { name: grid, type: "number[][]" }
returns: number
hints:
  - At time `t` you can stand on any cell with elevation `<= t`. A route is usable once `t` reaches the highest cell on it.
  - So you want the route whose maximum elevation is smallest — a minimax path. Dijkstra with `max` instead of `+` finds it.
complexity: { time: "O(n² log n)", space: "O(n²)" }
---

You're given an `n x n` grid where `grid[r][c]` is the elevation of cell `(r, c)`; the values are a permutation of `0` to `n² - 1`.

Rain starts at time `0`, and at time `t` the water level everywhere is `t`. You can move between two edge-adjacent cells only when **both** elevations are at most `t`. Moving takes no time.

Starting at `(0, 0)`, return the earliest time `t` at which you can reach `(n - 1, n - 1)`.

## Constraints

- `1 <= n <= 50`
- The values of `grid` are a permutation of `0 .. n² - 1`.
