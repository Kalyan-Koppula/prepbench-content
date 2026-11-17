---
title: Promise.all fails fast
difficulty: Medium
order: 16
tags: [promise-all, errors, timers]
frequency: medium
expected: |
  finish B
  all failed: B
  finish C
  finish A
---

```js
const task = (ms, name, ok = true) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      console.log('finish', name)
      ok ? resolve(name) : reject(new Error(name))
    }, ms)
  )

Promise.all([task(30, 'A'), task(10, 'B', false), task(20, 'C', false)])
  .then(() => console.log('all ok'))
  .catch((e) => console.log('all failed:', e.message))
```

## Explanation

1. All three timers start immediately.
2. At ~10 ms, `B` rejects. `Promise.all` rejects on the **first** rejection, so after that timer's microtasks drain, `all failed: B` logs.
3. The other tasks are not cancelled; promises have no cancellation. `C` still finishes at ~20 ms and rejects, but `Promise.all` has already settled, so that rejection is ignored (and it isn't reported as unhandled, because `Promise.all` attached a handler to it).
4. `A` finishes at ~30 ms.

Rule to remember: `Promise.all` rejects with the first error and ignores the rest, but the losing work keeps running.
