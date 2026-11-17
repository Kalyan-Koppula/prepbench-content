---
title: Array.from
difficulty: Medium
order: 8
tags: [arrays, iterables, array-likes]
frequency: low
exports: [arrayFrom]
hints:
  - Check for `Symbol.iterator` first; anything iterable (strings, Sets, Maps, generators) is consumed with `for…of`.
  - Otherwise treat the value as an array-like — coerce `length` to a whole number of 0 or more, then read indices `0 … length - 1`.
  - Apply `mapFn` as you copy, passing only `(value, index)` and using `thisArg` as `this`.
---

Implement `arrayFrom(source, mapFn?, thisArg?)`, a standalone version of `Array.from`.

```js
arrayFrom('héllo')                         // ['h', 'é', 'l', 'l', 'o']
arrayFrom(new Set([1, 1, 2]))              // [1, 2]
arrayFrom({ length: 3 }, (_, i) => i * i)  // [0, 1, 4]
arrayFrom(new Map([['a', 1]]))             // [['a', 1]]
```

**Don't use** `Array.from` itself.

## Notes

- **Iterables first:** if `source[Symbol.iterator]` is a function, collect what it yields (strings iterate by code point, so `'a😀'` gives 2 items). An iterable's `length` is ignored.
- **Array-likes:** otherwise read `length`, convert it to a whole number (`'2'` → 2, `2.7` → 2, negative or not a number → 0) and copy indices `0 … length - 1`; missing indices become `undefined`.
- The result is always a new, dense array (holes in an array source become `undefined`).
- `mapFn(value, index)` is called with exactly those two arguments and `this` set to `thisArg`; its result is stored.
- `source` of `null`/`undefined` → `TypeError`. A `mapFn` that is given but isn't a function → `TypeError`. Other primitives without a `length`, like `42`, give `[]`.
