---
title: Microtasks between timers
difficulty: Medium
order: 7
tags: [microtasks, timers]
frequency: high
expected: |
  micro
  t1
  t1 micro
  t2
  micro timer
  t1 nested
---

```js
setTimeout(() => {
  console.log('t1')
  Promise.resolve().then(() => console.log('t1 micro'))
  setTimeout(() => console.log('t1 nested'), 0)
}, 0)

setTimeout(() => console.log('t2'), 0)

Promise.resolve().then(() => {
  console.log('micro')
  setTimeout(() => console.log('micro timer'), 0)
})
```

## Explanation

**Sync pass:** nothing logs. Tasks: `[t1, t2]`. Microtasks: `[micro]`.

**Microtasks:** `micro` logs and adds a timer. Tasks: `[t1, t2, micro timer]`.

**Task t1:** `t1` logs, queues a microtask, and adds a timer at the back. Tasks: `[t2, micro timer, t1 nested]`. Before the next task, the microtask queue drains, so `t1 micro` logs.

**Remaining tasks:** `t2`, `micro timer`, `t1 nested`, in the order they were added.

Rule to remember: after *every* task the microtasks drain, and a timer created inside a callback goes behind every timer already waiting.
