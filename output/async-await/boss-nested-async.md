---
title: "Boss: nested async functions"
difficulty: Hard
order: 15
tags: [async-await, microtasks, timers]
frequency: high
expected: |
  s1
  a1
  b1
  s2
  b2
  p1
  a2
  p2
  t
---

```js
async function a() {
  console.log('a1')
  await b()
  console.log('a2')
}

async function b() {
  console.log('b1')
  await null
  console.log('b2')
}

console.log('s1')
setTimeout(() => console.log('t'), 0)
a()
Promise.resolve()
  .then(() => console.log('p1'))
  .then(() => console.log('p2'))
console.log('s2')
```

## Explanation

**Sync pass:** `s1`. The timer is queued. `a()` logs `a1` and calls `b()`, which logs `b1` and pauses at `await null` (queuing `b`'s continuation). `b()` returns a **pending** promise, so `a` awaits it and pauses; nothing is queued for `a` yet. `p1` is queued. `s2`.
Microtasks: `[b cont, p1]`.

**Round 1:** `b2` logs; `b` returns, fulfilling its promise, which queues `a`'s continuation. `p1` logs and queues `p2`. Queue: `[a cont, p2]`.

**Round 2:** `a2`, then `p2`.

**Task:** `t`.

Rule to remember: an `await` on another async function resumes one tick after that function *finishes*, not after it starts.
