---
title: Curry
difficulty: Medium
order: 8
tags: [closures, higher-order functions]
frequency: high
exports: [curry]
hints:
  - "`fn.length` tells you how many arguments `fn` declares; that's the target."
  - Each call returns either `fn`'s result (enough arguments collected) or a new function that remembers the arguments so far.
  - Build a new array on every step instead of pushing onto a shared one, so partially applied functions can be reused independently.
---

Implement `curry(fn)`. The curried function collects arguments across calls and calls `fn` as soon as it has at least `fn.length` of them.

```js
const volume = curry((l, w, h) => l * w * h)
volume(2)(3)(4)   // 24
volume(2, 3)(4)   // 24
volume(2)(3, 4)   // 24
volume(2, 3, 4)   // 24

const area2 = volume(2)  // reusable: area2(3)(4) and area2(5)(6) don't interfere
```

## Notes

- Each call may pass any number of arguments, including none (a call with no arguments returns a function that is still waiting).
- When the arguments reach `fn.length` or more, call `fn` with **all** collected arguments, extras included, and return its result.
- If `fn.length` is `0`, the first call runs `fn`.
- Partially applied functions must be independent and reusable.
- You don't need to handle `this`.
