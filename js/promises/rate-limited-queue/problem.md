---
title: Rate-limited queue
difficulty: Hard
order: 16
tags: [promises, timers, rate-limiting, queues]
frequency: medium
exports: [createRateLimiter]
hints:
  - Remember the timestamps of recent starts. A slot is free when fewer than `limit` of them are newer than `now - windowMs`.
  - Start as many queued tasks as there are free slots, in FIFO order. If tasks are still waiting, set one timer for the moment the oldest start leaves the window.
  - The limit is on starts, not on running tasks, so don't wait for tasks to finish.
---

An API allows at most `limit` requests per `windowMs` milliseconds. Implement `createRateLimiter(limit, windowMs)`, which returns a function `schedule(task)`:

- `schedule(task)` returns a promise that settles with the outcome of `task()` (a function returning a promise or a value).
- Tasks **start** in the order they were scheduled (FIFO).
- At any moment, at most `limit` tasks may have started within the **sliding** window: a task that started at time `s` counts against the limit until time `s + windowMs` (at that exact moment it stops counting).
- A task starts as soon as it is allowed to, and synchronously inside `schedule` if a slot is free right away and nothing is waiting ahead of it.

```js
const schedule = createRateLimiter(2, 1000) // 2 calls per second
const results = await Promise.all(ids.map((id) => schedule(() => fetch(`/api/items/${id}`))))
```

With `limit = 2` and `windowMs = 100`: tasks scheduled at 0 ms start at 0, 0, 100, 100, 200, and so on.

## Notes

- Only starts are limited. Tasks may take as long as they like and several can run at once.
- A task that rejects or throws rejects its promise but still counted as a start.
- When nothing is waiting, leave no timers behind. Use `Date.now()` for the current time.
