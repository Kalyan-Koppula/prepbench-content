---
title: Array.prototype.flat
difficulty: Medium
order: 7
tags: [arrays, recursion, prototypes]
frequency: high
exports: [myFlat]
hints:
  - Write a recursive helper `(source, depth, out)` that pushes elements into `out`, recursing into elements that are arrays while `depth > 0`.
  - "`Array.isArray` decides what gets flattened; strings and array-likes are left alone."
  - Normalize `depth` first, `undefined` → 1, `NaN` → 0, and use `i in source` to skip holes.
---

Implement `myFlat(depth = 1)` so that `arr.myFlat(depth)` behaves like `arr.flat(depth)`: it returns a new array with nested arrays spread into it, up to `depth` levels deep.

Write it as a plain function that reads the array from `this`. The tests install it as `Array.prototype.myFlat`.

```js
[1, [2, [3, [4]]]].myFlat()          // [1, 2, [3, [4]]]
[1, [2, [3, [4]]]].myFlat(2)         // [1, 2, 3, [4]]
[1, [2, [3, [4]]]].myFlat(Infinity)  // [1, 2, 3, 4]
[1, , [2, , 3]].myFlat()             // [1, 2, 3], holes are dropped
```

**Don't use** the built-in `flat` or `flatMap`.

## Notes

- `depth` defaults to `1` (also when `undefined` is passed). `0`, negative numbers and `NaN` mean "don't flatten": you get a shallow copy.
- Only real arrays (`Array.isArray`) are flattened. Strings, array-likes and other objects are kept as elements.
- Holes are removed from every array that gets flattened (including the top level). Arrays nested deeper than `depth` are kept as they are.
- `undefined` and `null` elements that really exist are kept.
- Don't modify the original array.
