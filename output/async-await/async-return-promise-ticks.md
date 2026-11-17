---
title: Returning a promise from an async function
difficulty: Hard
order: 13
tags: [async-await, microtasks]
frequency: low
expected: |
  plain
  tick 1
  tick 2
  wrapped
  tick 3
---

```js
async function plain() {
  return 'plain'
}

async function wrapped() {
  return Promise.resolve('wrapped')
}

wrapped().then((v) => console.log(v))
plain().then((v) => console.log(v))

Promise.resolve()
  .then(() => console.log('tick 1'))
  .then(() => console.log('tick 2'))
  .then(() => console.log('tick 3'))
```

## Explanation

**Sync pass:**
- `wrapped()` returns a promise from inside an async function. Its own result promise has to *adopt* that promise, which queues an adopt job. The result is still pending, so the `.then` only registers.
- `plain()` returns a plain value, so its promise is already fulfilled and the `.then` is queued.
- `tick 1` is queued.

Queue: `[adopt, plain, tick 1]`.

**Microtasks:**
1. **adopt** calls `.then` on the inner promise, queuing a reaction.
2. `plain` logs. `tick 1` logs and queues `tick 2`.
3. The reaction fulfils `wrapped()`'s promise and queues its handler.
4. `tick 2` logs, then `wrapped`, then `tick 3`.

Rule to remember: an async function that returns a promise settles two ticks later than one that returns a value. `return await p` costs only one extra tick.
