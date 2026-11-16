---
title: Flood Fill
difficulty: Easy
order: 1
lists: [striver]
tags: [dfs, bfs, matrix]
leetcode: flood-fill
function: floodFill
params:
  - { name: image, type: "number[][]" }
  - { name: sr, type: number }
  - { name: sc, type: number }
  - { name: color, type: number }
returns: "number[][]"
hints:
  - Which cells change? Exactly those reachable from the start through edge-adjacent cells of the same original colour.
  - Remember the start cell's original colour before painting anything. What happens if it already equals `color`?
complexity: { time: "O(m · n)", space: "O(m · n)" }
---

An image is stored as an `m x n` grid of integers, where `image[r][c]` is the colour of pixel `(r, c)`.

Starting from pixel `(sr, sc)`, repaint it and every pixel connected to it with `color`. Two pixels are connected when they share an edge (up, down, left or right) and both have the **same colour as the starting pixel originally had**; connectivity is transitive.

Return the image after the fill.

## Constraints

- `1 <= m, n <= 50`
- `0 <= image[r][c], color < 2^16`
- `0 <= sr < m`, `0 <= sc < n`
