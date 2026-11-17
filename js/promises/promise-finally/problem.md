---
title: Promise.prototype.finally
difficulty: Medium
order: 5
tags: [promises, polyfill, errors]
frequency: medium
exports: [promiseFinally]
hints:
  - Build it from `then` with two handlers, one for fulfilment and one for rejection; both run the callback.
  - The callback may return a promise. Wait for it with `Promise.resolve(onFinally())` before passing the original outcome along.
  - After waiting, return the original value or re-throw the original reason, unless the callback itself failed.
---

Implement `promiseFinally(promise, onFinally)`, a helper that returns what `promise.finally(onFinally)` would, without calling `.finally`.

The rules of `finally`:

- `onFinally` runs once the promise settles, either way, and receives **no arguments**.
- The result settles **the same way as the original promise**: its value or rejection reason passes through, and whatever `onFinally` returns is ignored.
- If `onFinally` returns a promise (or thenable), the result waits for it before settling.
- If `onFinally` throws, or returns a promise that rejects, the result rejects with **that** error instead.

```js
let loading = true
promiseFinally(fetchItems(), () => { loading = false })
  .then((items) => render(items)) // still receives the items
```

## Notes

- If `onFinally` is not a function, the original outcome passes through unchanged.
- `onFinally` must never run synchronously, even for an already-settled promise.
