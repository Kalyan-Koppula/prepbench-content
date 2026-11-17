---
title: Deep Equal
difficulty: Hard
order: 3
tags: [recursion, equality, map, set, cycles]
frequency: high
exports: [deepEqual]
hints:
  - Handle the cheap cases first (same reference, NaN, primitives), then make sure both objects have the same prototype before comparing contents.
  - Compare Dates, RegExps, Maps, Sets, arrays and plain objects each with their own rule.
  - For cycles, keep a list of pairs you are currently comparing; meeting the same pair again means "assume equal for now".
---

Implement `deepEqual(a, b)`, which returns `true` when two values have the same structure and contents.

```js
deepEqual({ tags: ['a', 'b'], meta: { n: 1 } }, { meta: { n: 1 }, tags: ['a', 'b'] }) // true
deepEqual([1, 2], [2, 1])                 // false
deepEqual(NaN, NaN)                       // true
deepEqual(new Set([[1]]), new Set([[1]])) // true
```

## Notes

The rules, in order:

- **Primitives** are compared with SameValueZero, the rule `Map` and `Set` use: `NaN` equals `NaN`, and `0` equals `-0`. No type coercion (`1` is not `'1'`).
- **Objects** must have the same prototype (`Object.getPrototypeOf`). An array never equals a plain object, and a class instance never equals a plain object with the same fields.
- **Arrays:** same length, equal items position by position.
- **Plain objects and class instances:** the same own enumerable string keys, in any order, with equal values. A key set to `undefined` is **not** the same as a missing key.
- **Dates:** same time value. **RegExps:** same `source` and `flags`.
- **Maps:** same size; every key of `a` is a key of `b` (looked up with `b.has`, so object keys must be the same reference) and the values are deeply equal.
- **Sets:** same size, and members can be paired up one-to-one so that each pair is deeply equal.
- **Functions** are equal only to themselves.
- Inputs may contain **cycles**; two structures that repeat the same way are equal.
- The tests build dates with `window.Date`, the same `Date` constructor your code sees in the sandbox.
