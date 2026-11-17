---
title: Microtasks queued by microtasks
difficulty: Easy
order: 3
tags: [microtasks, queueMicrotask, timers]
frequency: medium
expected: |
  sync
  m1
  m2
  m3
  t
---

```js
setTimeout(() => console.log('t'), 0)

queueMicrotask(() => {
  console.log('m1')
  queueMicrotask(() => console.log('m3'))
})

queueMicrotask(() => console.log('m2'))

console.log('sync')
```

## Explanation

**Sync pass:** the timer callback goes to the task queue, `m1` and `m2` go to the microtask queue, and `sync` logs.

**Microtasks:** `m1` runs and queues `m3` at the *back* of the microtask queue, behind `m2`. So `m2` logs, then `m3`. The queue keeps draining until it is empty, including microtasks added while draining.

**Tasks:** only now does the timer get a turn: `t`.

Rule to remember: the microtask queue is drained to empty, so a microtask scheduled by another microtask still beats every pending timer.
