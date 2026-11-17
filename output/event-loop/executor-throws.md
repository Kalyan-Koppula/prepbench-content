---
title: Throwing inside the executor
difficulty: Easy
order: 6
tags: [promises, executor, errors]
frequency: low
expected: |
  sync done
  a rejected: in executor
  b fulfilled: fine
---

```js
const a = new Promise(() => {
  throw new Error('in executor')
})
a.catch((e) => console.log('a rejected:', e.message))

const b = new Promise((resolve) => {
  resolve('fine')
  throw new Error('too late')
})
b.then((v) => console.log('b fulfilled:', v))

console.log('sync done')
```

## Explanation

1. The `Promise` constructor wraps the executor in a try/catch. When the executor of `a` throws, the error doesn't escape. It becomes `a`'s rejection reason.
2. `b`'s executor calls `resolve('fine')` first, then throws. The constructor catches that error and tries to reject `b`, but `b` has already settled, so the error is simply dropped.
3. Both handlers are queued as microtasks, so `sync done` logs first.
4. Microtasks run in the order the handlers were queued: `a rejected: in executor`, then `b fulfilled: fine`.

Rule to remember: a throw in the executor is the same as calling `reject`, and like `reject`, it does nothing once the promise has settled.
