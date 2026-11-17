---
title: await continuations vs then chains
difficulty: Medium
order: 6
tags: [async-await, microtasks]
frequency: high
expected: |
  task 1
  sync
  task 2
  then 1
  task 3
  then 2
---

```js
async function task() {
  console.log('task 1')
  await undefined
  console.log('task 2')
  await undefined
  console.log('task 3')
}

task()

Promise.resolve()
  .then(() => console.log('then 1'))
  .then(() => console.log('then 2'))

console.log('sync')
```

## Explanation

**Sync pass:** `task 1` logs, then `task` pauses at its first `await` and queues its continuation. `then 1` is queued after it. `sync` logs. Microtasks: `[task cont 1, then 1]`.

**Round 1:** `task 2` logs; the next `await` queues `task cont 2`. `then 1` logs and queues `then 2`. Queue: `[task cont 2, then 2]`.

**Round 2:** `task 3`, then `then 2`.

Each `await` behaves like one `then` step, so the two take turns.

Rule to remember: each `await` on an already-settled value costs exactly one microtask, the same as one link in a `then` chain.
