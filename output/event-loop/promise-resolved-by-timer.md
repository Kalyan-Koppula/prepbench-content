---
title: A promise resolved inside a timer
difficulty: Medium
order: 11
tags: [promises, timers, microtasks]
frequency: medium
expected: |
  executor
  sync
  timer fires
  after resolve
  then value
  second timer
---

```js
const p = new Promise((resolve) => {
  console.log('executor')
  setTimeout(() => {
    console.log('timer fires')
    resolve('value')
    console.log('after resolve')
  }, 0)
})

p.then((v) => console.log('then', v))

setTimeout(() => console.log('second timer'), 0)

console.log('sync')
```

## Explanation

**Sync pass:** the executor logs `executor` and adds the first timer. `p.then` registers on a pending promise. The second timer is added. `sync` logs. Tasks: `[first timer, second timer]`. No microtasks.

**First timer task:** `timer fires`. `resolve('value')` fulfils `p` and queues the `then` callback, but the current callback keeps running: `after resolve`. When the task ends, microtasks drain and `then value` logs.

**Second timer task:** `second timer`.

Rule to remember: resolving a promise queues its handlers as microtasks, and they run as soon as the current task finishes, ahead of the next timer.
