---
title: Array.prototype.map
difficulty: Easy
order: 4
tags: [arrays, prototypes, this]
frequency: high
exports: [myMap]
hints:
  - "`this` is the array (or array-like). Read its `length` once, before the loop."
  - "Check `i in arr` before visiting an index: holes are skipped and stay holes in the result."
  - Pre-size the result with `new Array(length)` and assign by index, so holes line up and the result has the right length.
---

Implement `myMap(callback, thisArg)` so that `arr.myMap(cb)` behaves like `arr.map(cb)`.

Write it as a plain function that reads the array from `this`. The tests install it as `Array.prototype.myMap` and also call it on array-likes with `Array.prototype.myMap.call(arrayLike, cb)`.

```js
[1, 2, 3].myMap((n) => n * 10)               // [10, 20, 30]
['a', 'b'].myMap((s, i) => s + i)             // ['a0', 'b1']
[1, , 3].myMap((n) => n * 2)                  // [2, <hole>, 6]
```

**Don't use** the built-in `map` (or `Array.from` with a mapper).

## Notes

- `callback(value, index, array)` is called with `this` set to `thisArg`.
- The result is a new array with the same length; the original is not changed.
- Holes are skipped (the callback isn't called for them) and remain holes in the result.
- Only indices below the **original** length are visited. Values are read when visited, so changes made by the callback to later elements are seen.
- If `callback` is not a function, throw a `TypeError`, even for an empty array.
