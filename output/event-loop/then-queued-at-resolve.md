---
title: When a then callback is actually queued
difficulty: Medium
order: 10
tags: [promises, microtasks, queueMicrotask]
frequency: medium
expected: |
  sync
  micro 1
  then
  micro 2
---

```js
let resolveIt
const p = new Promise((resolve) => {
  resolveIt = resolve
})

p.then(() => console.log('then'))
queueMicrotask(() => console.log('micro 1'))

resolveIt()
queueMicrotask(() => console.log('micro 2'))

console.log('sync')
```

## Explanation

1. `p` is pending, so `p.then(...)` only *registers* the callback on `p`. Nothing is queued yet.
2. `micro 1` is queued. Microtasks: `[micro 1]`.
3. `resolveIt()` fulfils `p`, and **now** its registered reaction is queued: `[micro 1, then]`.
4. `micro 2` is queued: `[micro 1, then, micro 2]`.
5. `sync` logs, then the queue drains in order.

Rule to remember: a `then` callback enters the microtask queue when the promise settles, not when `.then` is called.
