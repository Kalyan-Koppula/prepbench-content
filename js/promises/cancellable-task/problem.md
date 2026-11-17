---
title: Cancellable task with AbortSignal
difficulty: Hard
order: 13
tags: [promises, abortcontroller, timers, cleanup]
frequency: medium
exports: [cancellable]
hints:
  - Create your own `AbortController` for the task and hand its `signal` to the task. Abort it when the caller aborts or the timeout fires.
  - Funnel every way of finishing (task done, caller abort, timeout) through one `cleanup` that clears the timer and removes the abort listener.
  - Check `signal.aborted` before doing anything; an already-aborted signal never fires an `abort` event.
---

Implement `cancellable(task, options)`. `task` is a function `(signal) => promise` that does some async work and can stop early when `signal` aborts (like `fetch`). `cancellable` runs it and returns a promise for its result, with cancellation and a timeout layered on top.

Options (both optional):

- `signal`: an `AbortSignal` from the caller.
- `timeout`: a number of milliseconds.

Behaviour:

- `task` is called synchronously with a **new** `AbortSignal` that you control (not the caller's).
- If the task settles first, the returned promise settles the same way.
- If the caller's `signal` aborts first, the returned promise rejects **immediately** with an `Error` whose `name` is `'AbortError'`, and the task's signal is aborted.
- If `timeout` ms pass first, the returned promise rejects with an `Error` whose `name` is `'TimeoutError'`, and the task's signal is aborted.
- If the caller's `signal` is **already aborted**, reject with an `AbortError` without calling `task`.
- Whichever happens first wins, and then **clean up**: clear the timer and stop listening to the caller's signal. Aborting the caller's signal after the task has finished must have no effect.

```js
const controller = new AbortController()
const report = cancellable((signal) => fetch('/api/report', { signal }), {
  signal: controller.signal,
  timeout: 5000,
})
cancelButton.onclick = () => controller.abort()
```

## Notes

- If `task` throws synchronously, reject with that error.
- Any message is fine for the errors you create.
