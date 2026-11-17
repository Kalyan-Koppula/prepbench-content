---
title: Array.prototype.filter
difficulty: Easy
order: 5
tags: [arrays, prototypes, this]
frequency: high
exports: [myFilter]
hints:
  - "`this` is the array or array-like. Capture `length` once before looping."
  - Skip indices that don't exist (`i in arr`); the callback is never called for holes.
  - Push kept values onto a fresh array; the result is always dense.
---

Implement `myFilter(callback, thisArg)` so that `arr.myFilter(cb)` behaves like `arr.filter(cb)`.

Write it as a plain function that reads the array from `this`. The tests install it as `Array.prototype.myFilter` and also call it on array-likes with `Array.prototype.myFilter.call(arrayLike, cb)`.

```js
[1, 2, 3, 4].myFilter((n) => n % 2 === 0)  // [2, 4]
['a', '', 'b'].myFilter(Boolean)            // ['a', 'b']
[1, , 3].myFilter(() => true)               // [1, 3]
```

**Don't use** the built-in `filter`.

## Notes

- `callback(value, index, array)` is called with `this` set to `thisArg`; an element is kept when the result is **truthy**.
- Return a new, dense array; don't change the original.
- Holes are skipped. Only indices below the original length are visited.
- If `callback` is not a function, throw a `TypeError`, even for an empty array.
