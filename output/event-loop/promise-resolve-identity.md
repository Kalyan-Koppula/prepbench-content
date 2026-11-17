---
title: Promise.resolve(p) vs new Promise(r => r(p))
difficulty: Hard
order: 22
tags: [promises, microtasks]
frequency: low
expected: |
  true false
  a
  p
  b
---

```js
const p = Promise.resolve('x')
const a = Promise.resolve(p)
const b = new Promise((resolve) => resolve(p))

console.log(a === p, b === p)

b.then(() => console.log('b'))
a.then(() => console.log('a'))
p.then(() => console.log('p'))
```

## Explanation

1. `Promise.resolve(p)` returns `p` itself when `p` is already a native promise, so `a === p`.
2. `new Promise(...)` always creates a new object, so `b !== p`. Calling `resolve(p)` with a promise doesn't fulfil `b`; `b` must *adopt* `p`, which queues a job to call `p.then(...)`. `b` is still pending.
3. Queue after the sync pass: `[adopt b, a, p]`. `b.then` only registered, because `b` is pending; `a` and `p` are the same fulfilled promise, so both handlers were queued.
4. **adopt b** calls `p.then(resolveB)`, which queues one more job to fulfil `b`.
5. `a` and `p` log.
6. `b` fulfils, its handler is queued, and `b` logs last, even though its `then` was attached first.

Rule to remember: `Promise.resolve(nativePromise)` is a no-op, while resolving a new promise with another promise takes two extra ticks.
