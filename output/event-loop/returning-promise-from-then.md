---
title: Returning a promise costs extra ticks
difficulty: Hard
order: 18
tags: [promises, microtasks, chaining]
frequency: medium
expected: |
  tick 1
  fast
  tick 2
  tick 3
  slow
  tick 4
---

```js
Promise.resolve()
  .then(() => Promise.resolve('slow'))
  .then((v) => console.log(v))

Promise.resolve()
  .then(() => 'fast')
  .then((v) => console.log(v))

Promise.resolve()
  .then(() => console.log('tick 1'))
  .then(() => console.log('tick 2'))
  .then(() => console.log('tick 3'))
  .then(() => console.log('tick 4'))
```

## Explanation

Call the chains S (slow), F (fast) and T (ticks). The first handler of each is queued during the sync pass: `[S1, F1, T1]`.

1. **S1** returns a promise. The `then` promise can't just take it as a value; it has to *adopt* it. That queues a job that will call `.then` on the returned promise: `[F1, T1, adopt]`.
2. **F1** returns `'fast'`, a plain value, so its `then` promise fulfils and queues F2: `[T1, adopt, F2]`.
3. **T1** logs `tick 1` and queues T2.
4. **adopt** calls `.then` on the already-fulfilled returned promise, which queues one more reaction to pass `'slow'` along.
5. **F2** logs `fast`. **T2** logs `tick 2`.
6. The reaction fulfils S's `then` promise, queuing S2. Meanwhile **T3** logs `tick 3`.
7. **S2** logs `slow`, then **T4** logs `tick 4`.

Returning a plain value settles the next step in one hop; returning a promise takes two extra hops.

Rule to remember: returning a promise (or any thenable) from `then` delays the chain by two microtask ticks compared with returning a value.
