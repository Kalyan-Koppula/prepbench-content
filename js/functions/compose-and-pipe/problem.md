---
title: Compose and pipe
difficulty: Easy
order: 11
tags: [higher-order functions, reduce]
frequency: medium
exports: [compose, pipe]
hints:
  - "`pipe` is a fold: start with the first function's result, then feed it through the rest with `reduce`."
  - "`compose(...fns)` is `pipe` with the functions reversed (copy before reversing)."
  - Only the first function to run gets all the arguments; handle the empty list by returning the first argument.
---

Implement two helpers that chain functions:

- `pipe(f, g, h)` returns a function that runs **left to right**: `h(g(f(...args)))`.
- `compose(f, g, h)` returns a function that runs **right to left**: `f(g(h(...args)))`.

```js
const trim = (s) => s.trim()
const lower = (s) => s.toLowerCase()
const slug = (s) => s.replace(/\s+/g, '-')

pipe(trim, lower, slug)('  Hello World ')    // "hello-world"
compose(slug, lower, trim)('  Hello World ') // "hello-world"

const addThenDouble = pipe((a, b) => a + b, (x) => x * 2)
addThenDouble(3, 4) // 14
```

## Notes

- The first function to run receives all arguments; every later one receives the previous result.
- With no functions, the result is the identity: it returns its first argument.
- Every function is called with the same `this` as the composed function.
- The composed function is reusable and must not modify the list of functions.
