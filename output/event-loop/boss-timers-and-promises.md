---
title: "Boss: timers, executors and microtasks"
difficulty: Hard
order: 20
tags: [microtasks, timers, executor, queueMicrotask]
frequency: high
expected: |
  1
  4
  10
  8
  2
  3
  5
  6
  9
  7
---

```js
console.log('1')

setTimeout(() => {
  console.log('2')
  Promise.resolve().then(() => console.log('3'))
}, 0)

new Promise((resolve) => {
  console.log('4')
  setTimeout(() => {
    console.log('5')
    resolve()
  }, 0)
}).then(() => {
  console.log('6')
  setTimeout(() => console.log('7'), 0)
})

queueMicrotask(() => {
  console.log('8')
  setTimeout(() => console.log('9'), 0)
})

console.log('10')
```

## Explanation

**Sync pass:** `1`. Timer T2 is queued. The executor runs immediately (`4`) and queues timer T5; the promise stays pending, so `then` only registers. `8` is queued as a microtask. `10`.
Tasks: `[T2, T5]`, microtasks: `[8]`.

**Microtasks:** `8` logs and queues T9. Tasks: `[T2, T5, T9]`.

**T2:** `2`, then its microtask `3`.

**T5:** `5`, then `resolve()` queues the `then` handler, which runs right after the task: `6`. It queues T7. Tasks: `[T9, T7]`.

**T9:** `9`. **T7:** `7`.

Rule to remember: write two queues on paper and step one task at a time. After each task, empty the microtask queue before you touch the next timer.
