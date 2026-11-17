---
title: Function.prototype.apply
difficulty: Medium
order: 2
tags: [this, prototypes, array-likes]
frequency: medium
exports: [myApply]
hints:
  - Same trick as `call` — put the function on the context under a fresh `Symbol` and call it as a method, then remove it in `finally`.
  - Validate the second argument first. `null`/`undefined` mean no arguments; any other non-object (including a string) is a `TypeError`.
  - "An array-like only promises `length` and indexed keys; copy it into a real array with a plain loop before spreading."
---

Implement `myApply` so that `fn.myApply(thisArg, argsArray)` behaves like `fn.apply(thisArg, argsArray)`.

Write it as a plain function that reads the target function from `this`. The tests install it as `Function.prototype.myApply`:

```js
function max() {
  return Math.max(...arguments)
}
max.myApply(null, [3, 9, 4])                     // 9
max.myApply(null, { length: 2, 0: 5, 1: 7 })     // 7, array-likes work too
```

**Don't use** `call`, `apply`, `bind` or `Reflect.apply`.

## Notes

- `thisArg`: `null`/`undefined` → `globalThis`; primitives are boxed.
- `argsArray`: `null` or `undefined` → no arguments. Arrays and array-likes (objects with a `length`) are spread into the call. Holes become `undefined`.
- Any other non-object `argsArray` (`42`, `'ab'`, `true`) throws a `TypeError`.
- Don't modify `argsArray` or leave anything on the context, even if the function throws.
