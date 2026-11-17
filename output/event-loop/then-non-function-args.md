---
title: Passing non-functions to then
difficulty: Medium
order: 12
tags: [promises, chaining]
frequency: medium
expected: |
  sync?
  end
  value 1
---

```js
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .then(console.log('sync?'))
  .then((v) => console.log('value', v))

console.log('end')
```

## Explanation

1. Building the chain is synchronous, and every argument is evaluated while it's built. `console.log('sync?')` is a *call*, not a function, so it logs immediately and passes `undefined` to `then`.
2. `then` ignores any argument that isn't a function and passes the value through unchanged. `2`, `Promise.resolve(3)` and `undefined` are all ignored.
3. `end` logs and the script finishes.
4. Microtasks: the value `1` flows through the three pass-through steps to the last handler, which logs `value 1`.

Rule to remember: `then(x)` with a non-function `x` is `then(v => v)`, and `then(fn())` calls `fn` right away.
