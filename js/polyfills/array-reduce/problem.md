---
title: Array.prototype.reduce
difficulty: Medium
order: 6
tags: [arrays, prototypes, edge cases]
frequency: high
exports: [myReduce]
hints:
  - Whether an initial value was given is about the number of arguments, not its value. `reduce(fn, undefined)` *has* an initial value.
  - Without one, scan forward to the first index that exists (`i in arr`); that element is the starting accumulator and the loop continues after it.
  - If there's no initial value and no element exists, throw a `TypeError`.
---

Implement `myReduce(callback, initialValue?)` so that `arr.myReduce(cb, init)` behaves like `arr.reduce(cb, init)`.

Write it as a plain function that reads the array from `this`. The tests install it as `Array.prototype.myReduce`.

```js
[1, 2, 3].myReduce((sum, n) => sum + n, 0)        // 6
[1, 2, 3].myReduce((sum, n) => sum + n)           // 6, starts from 1
[[1], [2, 3]].myReduce((acc, a) => acc.concat(a)) // [1, 2, 3]
[].myReduce((a, b) => a + b)                      // TypeError
```

**Don't use** the built-in `reduce` or `reduceRight`.

## Notes

- `callback(accumulator, value, index, array)`; its return value becomes the next accumulator.
- **With an initial value** (even if it is `undefined`): start from it at index 0. An empty array returns it without calling the callback.
- **Without one:** the first existing element is the accumulator and iteration starts at the next index. A single element is returned without calling the callback. No elements at all → `TypeError`.
- Holes are skipped. Only indices below the original length are visited.
- A non-function `callback` throws a `TypeError`.
