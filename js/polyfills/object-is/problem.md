---
title: Object.is
difficulty: Easy
order: 13
tags: [equality, numbers, edge cases]
frequency: low
exports: [objectIs]
hints:
  - "`===` is right for everything except two cases: `NaN` (should be equal to itself) and `+0`/`-0` (should differ)."
  - "`NaN` is the only value for which `x !== x` is true."
  - "`1 / 0` is `Infinity` and `1 / -0` is `-Infinity`; that's how to tell the zeros apart."
---

Implement `objectIs(a, b)`, a standalone version of `Object.is`: the **SameValue** comparison used by `Map` keys, React's dependency arrays and more.

```js
objectIs(1, 1)        // true
objectIs(NaN, NaN)    // true   (NaN === NaN is false)
objectIs(0, -0)       // false  (0 === -0 is true)
objectIs({}, {})      // false  (different objects)
objectIs('1', 1)      // false  (no type coercion)
```

**Don't use** `Object.is`.

## Notes

- Behave like `===` in every other case: no coercion, objects compared by reference.
- `Number.isNaN` and arithmetic are fine to use.
