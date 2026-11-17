---
title: Build a Promise
difficulty: Hard
order: 7
tags: [promises, microtasks, classes, polyfill]
frequency: high
exports: [MyPromise]
hints:
  - Keep `state`, `value` and a list of waiting callbacks. `resolve`/`reject` do nothing once the state has left `pending`.
  - "`then` always returns a new MyPromise. Its callback's return value resolves that new promise, and a throw rejects it; a missing callback passes the outcome straight through."
  - Resolving with something that has a `then` method means following it, not storing it. Schedule every callback with `queueMicrotask`, even when the promise has already settled.
---

Implement a class `MyPromise` that works like a minimal native `Promise`, without using `Promise` inside it.

```js
new MyPromise((resolve) => setTimeout(resolve, 100, 2))
  .then((n) => n * 10)
  .then((n) => new MyPromise((resolve) => setTimeout(resolve, 50, n + 1)))
  .then(console.log) // after 150ms: 21
```

Support:

- **`new MyPromise(executor)`**: the executor runs **synchronously** with `resolve` and `reject`. If it throws, the promise rejects (unless it already settled).
- **Settles once**: after the first `resolve` or `reject`, later calls are ignored.
- **`then(onFulfilled, onRejected)`** returns a new `MyPromise`:
  - callbacks always run **asynchronously as microtasks** (`queueMicrotask`), after the current synchronous code, even if the promise has already settled;
  - a callback's return value fulfils the new promise; a throw rejects it;
  - a missing (non-function) callback passes the value or reason through;
  - several `then` calls on the same promise run in the order they were registered.
- **Adoption**: resolving with a `MyPromise` or any thenable (an object or function with a `then` method) follows it, both in `resolve(...)` and in values returned from callbacks.
- **`catch(onRejected)`** and **`finally(onFinally)`** (same rules as the native `finally`: the callback gets no arguments and the outcome passes through).
- **`MyPromise.resolve(value)`** (returns `value` itself if it is already a `MyPromise`) and **`MyPromise.reject(reason)`**.

## Notes

- Because `MyPromise` has a `then` method, `await` works on it.
- Don't worry about unhandled-rejection tracking, `Symbol.species`, or the self-resolution `TypeError`.
