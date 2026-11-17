---
title: Promise with timeout
difficulty: Easy
order: 8
tags: [promises, timers, cleanup]
frequency: high
exports: [withTimeout]
hints:
  - Race the input against a timer that rejects, inside one `new Promise`.
  - Whichever side settles first wins; a promise ignores later `resolve`/`reject` calls.
  - When the input settles first, clear the timer so nothing is left scheduled.
---

Implement `withTimeout(promise, ms)`. It returns a promise that settles like `promise` if `promise` settles within `ms` milliseconds. Otherwise it rejects after exactly `ms` milliseconds with an `Error` whose `name` is `'TimeoutError'` and whose `message` is `` `Timed out after ${ms}ms` ``.

```js
try {
  const user = await withTimeout(fetchUser(7), 2000)
} catch (e) {
  if (e.name === 'TimeoutError') showRetryBanner()
  else throw e
}
```

## Notes

- If `promise` settles first, **clear the timer**: leaving it scheduled keeps a Node process alive and wastes work.
- Anything `promise` does after the timeout is ignored.
- `promise` may also be a plain value or a thenable.
- The input is not cancelled; this helper only stops waiting for it.
