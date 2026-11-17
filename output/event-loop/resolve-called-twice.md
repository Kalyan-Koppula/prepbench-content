---
title: Calling resolve twice
difficulty: Easy
order: 5
tags: [promises, executor]
frequency: medium
expected: |
  executor done
  sync end
  then first
---

```js
const p = new Promise((resolve, reject) => {
  resolve('first')
  resolve('second')
  reject(new Error('nope'))
  console.log('executor done')
})

p.then((v) => console.log('then', v))
  .catch(() => console.log('catch'))

console.log('sync end')
```

## Explanation

1. The executor runs synchronously. `resolve('first')` settles `p` as fulfilled with `'first'`.
2. A promise settles **once**. The later `resolve('second')` and `reject(...)` are silently ignored, so the rejection never happens and nothing is "unhandled".
3. `executor done` logs because `resolve`/`reject` don't stop the executor.
4. `sync end` logs.
5. Microtasks: the `then` handler logs `then first`. The `catch` handler is skipped because the chain is fulfilled.

Rule to remember: first settle wins; every later `resolve`/`reject` is a no-op.
