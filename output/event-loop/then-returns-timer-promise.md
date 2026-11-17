---
title: A then that waits on a timer
difficulty: Hard
order: 21
tags: [promises, timers, chaining]
frequency: medium
expected: |
  sync
  p1
  q1
  t0
  t0 from p1
  p2
  t50
---

```js
setTimeout(() => console.log('t0'), 0)
setTimeout(() => console.log('t50'), 50)

Promise.resolve()
  .then(() => {
    console.log('p1')
    setTimeout(() => console.log('t0 from p1'), 0)
    return new Promise((resolve) => setTimeout(resolve, 20))
  })
  .then(() => console.log('p2'))

queueMicrotask(() => console.log('q1'))

console.log('sync')
```

## Explanation

**Sync pass:** timers `t0` (0 ms) and `t50` (50 ms) are set. The first `then` handler and `q1` are queued as microtasks. `sync` logs.

**Microtasks:** `p1` logs, sets a 0 ms timer and a 20 ms timer, and **returns** a promise that the 20 ms timer will resolve. The chain now waits on that promise, so `p2` isn't queued. `q1` logs.

**Tasks by due time:**
- `t0`, then `t0 from p1` (both 0 ms, created in that order).
- ~20 ms: the timer calls `resolve`. The returned promise fulfils, the chain adopts it, and `p2` logs during that task's microtask drain.
- ~50 ms: `t50`.

Rule to remember: a `then` that returns a promise pauses the chain until that promise settles, however many tasks that takes.
