---
title: Once
difficulty: Easy
order: 5
tags: [closures, this]
frequency: medium
exports: [once]
hints:
  - You need a flag that says whether `fn` already ran, separate from the stored result; the result itself can be `undefined` or `0`.
  - Set the flag before calling `fn` so a call made from inside `fn` doesn't start a second run.
  - If `fn` throws, undo the flag and rethrow.
---

Implement `once(fn)`. It returns a function that calls `fn` the first time it is called and, on every later call, returns the value from that first run without calling `fn` again.

```js
const init = once(() => {
  console.log('connecting…')
  return { connected: true }
})
const a = init() // logs "connecting…"
const b = init() // no log
a === b          // true
```

## Notes

- The first call forwards its `this` and all its arguments to `fn`. Later arguments are ignored.
- Any result counts, including `undefined`, `null`, `0` and `''`.
- If the first run **throws**, the error propagates and the call doesn't count: the next call tries `fn` again.
- A call made while `fn` is still running (from inside `fn` itself) must not run `fn` again; it returns `undefined`.
