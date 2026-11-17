---
title: Retry with exponential backoff
difficulty: Medium
order: 9
tags: [promises, timers, async-await, errors]
frequency: high
exports: [retry]
hints:
  - A loop with `try { return await fn(attempt) } catch (error) { … }` reads more clearly than recursion.
  - The wait after failed attempt n is `delay * factor ** (n - 1)`, capped at `maxDelay`. Sleep with a promise around `setTimeout`.
  - Before sleeping, give up if this was the last attempt or if `shouldRetry(error, attempt)` is false; then re-throw the error.
---

Implement `retry(fn, options)`, which calls the async function `fn` until it succeeds, waiting longer after each failure.

```js
const data = await retry((attempt) => fetchJson('/api/report'), {
  attempts: 4,
  delay: 200,
  shouldRetry: (error) => error.status >= 500, // don't retry 4xx
})
```

Options (all optional):

| Option | Default | Meaning |
|---|---|---|
| `attempts` | `3` | Total number of calls to `fn`, including the first. |
| `delay` | `100` | Wait in ms after the first failure. |
| `factor` | `2` | Each later wait is multiplied by this. |
| `maxDelay` | `Infinity` | No single wait is longer than this. |
| `shouldRetry` | `() => true` | Called as `shouldRetry(error, attempt)` after a failure that still has attempts left. Return `false` to give up immediately. |

Rules:

- `fn` is called as `fn(attempt)`, where `attempt` is `1` for the first call.
- The wait after failed attempt `n` is `min(delay * factor ** (n - 1), maxDelay)`. With the defaults the calls happen at 0 ms, 100 ms and 300 ms.
- The returned promise fulfils with the first successful result. If every attempt fails, or `shouldRetry` returns `false`, it rejects with the **most recent** error.

## Notes

- `fn` may throw synchronously or return a plain value; treat those like a rejection and a fulfilment.
- The first call happens synchronously, when `retry` is called.
- `shouldRetry` is not called after the final attempt.
