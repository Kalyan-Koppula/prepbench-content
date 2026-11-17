---
title: Limit call rate
difficulty: Medium
order: 12
tags: [closures, rate limiting, Date.now]
frequency: low
exports: [rateLimit]
hints:
  - Remember the timestamps of the calls you allowed, not the calls you dropped.
  - Before deciding, throw away timestamps that are `windowMs` or more in the past; what's left is the current window.
  - "`Date.now()` is all you need; no timers."
---

Implement `rateLimit(fn, limit, windowMs)`. The returned function lets **at most `limit` calls through in any `windowMs` window** (a sliding window).

- An allowed call runs `fn` immediately with the same `this` and arguments and returns its result.
- A call over the limit is **dropped**: `fn` doesn't run and the call returns `undefined`.

A call at time `now` is allowed if fewer than `limit` *allowed* calls happened in the window `(now - windowMs, now]`. So a call exactly `windowMs` after an earlier allowed call no longer counts that earlier call.

```js
const send = rateLimit((msg) => api.post(msg), 2, 1000)
send('a') // t=0     → sent
send('b') // t=400   → sent
send('c') // t=800   → dropped (2 calls in the last second)
send('d') // t=1000  → sent (the call at t=0 is now 1000ms old)
send('e') // t=1100  → dropped (400 and 1000 are within the last second)
```

## Notes

- Dropped calls don't count toward the limit.
- Use `Date.now()` for the current time; the tests control the clock.
- Each limited function has its own history.
