---
title: Flatten Array
difficulty: Medium
order: 16
tags: [arrays, recursion, stack]
frequency: high
exports: [flatten]
hints:
  - "Each item is either an array (go one level deeper, if depth allows) or a value (push it)."
  - Pass the remaining depth down; `Infinity - 1` is still `Infinity`.
  - "`forEach` skips holes in sparse arrays; `for...of` does not."
---

Implement `flatten(array, depth = 1)`, which works like `Array.prototype.flat`: nested arrays are spread into the result up to `depth` levels deep. Don't use `.flat()` or `.flatMap()`.

```js
flatten([1, [2, [3, [4]]]])           // [1, 2, [3, [4]]]
flatten([1, [2, [3, [4]]]], 2)        // [1, 2, 3, [4]]
flatten([1, [2, [3, [4]]]], Infinity) // [1, 2, 3, 4]
```

## Notes

- `depth` defaults to `1`. `0` or a negative depth returns a shallow copy.
- Only real arrays (`Array.isArray`) are flattened. Strings, array-like objects and other iterables are kept as single items.
- Like `.flat()`, **holes** in sparse arrays are skipped (at every level that gets flattened), but explicit `undefined` items are kept.
- Return a new array; don't mutate the input.
