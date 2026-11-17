---
title: Object.is, -0 and Set
difficulty: Medium
order: 6
tags: [equality, nan]
frequency: medium
expected: |
  true false
  false true
  -Infinity
  2
  true false
---

```js
console.log(Object.is(NaN, 0 / 0), NaN === 0 / 0)
console.log(Object.is(0, -0), 0 === -0)
console.log(1 / -0)
console.log(new Set([0, -0, NaN, NaN]).size)
console.log(Object.is('a', 'a'), Object.is({}, {}))
```

## Explanation

JavaScript has three "same" algorithms that differ only on `NaN` and `±0`:

| | `NaN` vs `NaN` | `0` vs `-0` |
|---|---|---|
| `===` | different | same |
| `Object.is` (SameValue) | same | different |
| SameValueZero (`Set`, `Map`, `includes`) | same | same |

1. `0 / 0` is `NaN`: `Object.is` says same, `===` says different.
2. `Object.is` distinguishes `0` from `-0`; `===` doesn't.
3. `-0` is observable through division: `1 / -0` is `-Infinity`.
4. `Set` uses SameValueZero: `0` and `-0` collapse, the two `NaN`s collapse. Size `2`.
5. For everything else `Object.is` behaves like `===`: equal strings are the same, two distinct objects are not.

Rule to remember: `Object.is` is `===` with the `NaN` and `-0` cases fixed; collections use SameValueZero.
