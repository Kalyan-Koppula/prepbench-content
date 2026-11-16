---
title: Detect Squares
difficulty: Medium
order: 7
lists: [neetcode150]
tags: [design, hash-map, geometry]
leetcode: detect-squares
kind: class
class: DetectSquares
params: []
methods:
  - name: add
    params: [{ name: point, type: "number[]" }]
    returns: void
  - name: count
    params: [{ name: point, type: "number[]" }]
    returns: number
hints:
  - Fix the query point. Once you pick the point diagonally opposite, the other two corners are determined.
  - "Store a count per coordinate. For each stored point `(x, y)` with `|x - qx| === |y - qy| > 0`, add `count(x, y) * count(qx, y) * count(x, qy)`."
complexity: { time: "O(1) add, O(k) count (k = stored distinct points)", space: "O(k)" }
---

Build a structure over a growing multiset of points on a 2D integer grid.

- `add(point)` stores `point = [x, y]`. Adding the same coordinates again stores another copy; copies count as different points.
- `count(point)` returns how many ways you can choose three stored points that, together with the query `point`, form the corners of a square with **positive area** whose sides are parallel to the x and y axes. The query point itself is not added.

Tests are a sequence of operations: the first creates the object, and the output lists each call's return value (`null` for the constructor and methods that return nothing).

## Constraints

- `point.length === 2`
- `0 <= x, y <= 1000`
- At most `3000` calls to `add` and `count` in total.
