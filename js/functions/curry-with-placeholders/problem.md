---
title: Curry with placeholders
difficulty: Hard
order: 9
tags: [closures, higher-order functions]
frequency: medium
exports: [curry]
hints:
  - Keep the collected arguments as an array that may contain holes (placeholders). New arguments first fill the holes from left to right, then get appended.
  - "`fn` is ready when the first `fn.length` slots exist and none of them is a placeholder."
  - Merge into a fresh array on every call; never mutate the array a partial application closed over.
---

Implement `curry(fn)` with placeholder support. `curry.placeholder` is a unique value (define it on `curry`) that callers pass to **skip a position** and fill it later.

```js
const _ = curry.placeholder
const fmt = curry((a, b, c) => `${a}-${b}-${c}`)

fmt(1)(2)(3)        // "1-2-3"
fmt(_, 2)(1)(3)     // "1-2-3"
fmt(_, _, 3)(1)(2)  // "1-2-3"
fmt(_, 2)(_, 3)(1)  // "1-2-3"
fmt(1, _, 3)(2)     // "1-2-3"
```

Merging rule: the arguments of a new call fill the existing placeholders **left to right**; any that are left over are appended at the end. A placeholder in a new call fills a hole with a hole, so it stays open.

`fn` runs once the first `fn.length` positions are all filled with real values (not placeholders). It receives every collected argument, extras included.

## Notes

- `undefined` is a real argument, not a placeholder.
- Partially applied functions must be independent and reusable.
- You don't need to handle `this`, or placeholders beyond `fn.length`.
