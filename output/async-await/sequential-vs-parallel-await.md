---
title: Sequential vs parallel awaits
difficulty: Medium
order: 8
tags: [async-await, timers, performance]
frequency: high
expected: |
  done par-b
  done seq-a
  done par-a
  parallel par-a par-b
  done seq-b
  sequential seq-a seq-b
---

```js
const delay = (ms, label) =>
  new Promise((resolve) =>
    setTimeout(() => {
      console.log('done', label)
      resolve(label)
    }, ms)
  )

async function sequential() {
  const a = await delay(30, 'seq-a')
  const b = await delay(10, 'seq-b')
  console.log('sequential', a, b)
}

async function parallel() {
  const pa = delay(30, 'par-a')
  const pb = delay(10, 'par-b')
  console.log('parallel', await pa, await pb)
}

sequential()
parallel()
```

## Explanation

**At 0 ms:** `sequential` starts the `seq-a` timer (30 ms) and pauses. `parallel` starts **both** `par-a` (30 ms) and `par-b` (10 ms) before awaiting anything.

**~10 ms:** `done par-b`. `parallel` is still waiting on `pa`.

**~30 ms:** `seq-a` fires first (created first): `done seq-a`. In that task's microtasks, `sequential` resumes and only now starts `seq-b` (10 ms). Then `par-a` fires: `done par-a`. `parallel` resumes; `await pb` is already fulfilled, so it logs `parallel par-a par-b`.

**~40 ms:** `done seq-b`, then `sequential seq-a seq-b`.

The sequential version took ~40 ms, the parallel one ~30 ms.

Rule to remember: the work starts when you *call* the function, not when you `await`. Start everything first, then await, to run in parallel.
