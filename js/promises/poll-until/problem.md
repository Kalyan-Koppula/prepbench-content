---
title: Poll until ready
difficulty: Medium
order: 14
tags: [promises, timers, backoff, cleanup]
frequency: medium
exports: [pollUntil]
hints:
  - "Write a `poll()` step: call `fn`, wait for its result, then either resolve or schedule the next `poll()` with `setTimeout`."
  - The n-th wait is `min(interval * factor ** (n - 1), maxInterval)`. Count the waits in a variable outside `poll`.
  - A separate deadline timer rejects on timeout. Use a `done` flag so a late poll result is ignored, and clear both timers when you finish.
---

Implement `pollUntil(fn, predicate, options)`. It calls the async function `fn` repeatedly until `predicate(result)` returns `true`, and fulfils with that result. Typical use: waiting for a background export job to finish.

```js
const job = await pollUntil(
  () => fetch('/api/exports/42').then((r) => r.json()),
  (job) => job.status === 'ready',
  { interval: 500, factor: 1.5, maxInterval: 5000, timeout: 60000 },
)
```

Options (all optional):

| Option | Default | Meaning |
|---|---|---|
| `interval` | `100` | First wait between polls, in ms. |
| `factor` | `1` | Each later wait is multiplied by this (1 means a fixed interval). |
| `maxInterval` | `Infinity` | No single wait is longer than this. |
| `timeout` | `Infinity` | Give up this many ms after `pollUntil` was called. |

Rules:

- The first call to `fn` happens synchronously.
- A wait starts when the previous poll's result **arrives**, not when the poll started. The n-th wait is `min(interval * factor ** (n - 1), maxInterval)`.
- When `timeout` ms have passed since the start without success, reject with an `Error` whose `name` is `'TimeoutError'`, at exactly that moment. Make no more calls and leave no timers behind; a poll still in flight is ignored when it returns.
- If `fn` rejects or throws, or `predicate` throws, reject with that error and stop polling.
- On success, clear any timer you created.
