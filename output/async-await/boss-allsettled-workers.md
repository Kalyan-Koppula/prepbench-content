---
title: "Boss: workers, allSettled and the tail"
difficulty: Hard
order: 16
tags: [async-await, promise-allsettled, microtasks, timers]
frequency: medium
expected: |
  A start
  B start
  C start
  C done
  A done
  fulfilled,rejected,fulfilled
  micro
  main end
  resolved
  timer
---

```js
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms))

async function worker(name, ms) {
  console.log(name, 'start')
  const v = await sleep(ms, name)
  if (v === 'B') throw new Error(v + ' failed')
  console.log(name, 'done')
  return v
}

async function main() {
  const jobs = [worker('A', 30), worker('B', 10), worker('C', 20)]
  const results = await Promise.allSettled(jobs)
  console.log(results.map((r) => r.status).join(','))
  queueMicrotask(() => console.log('micro'))
  setTimeout(() => console.log('timer'), 0)
  await null
  console.log('main end')
}

main().then(() => console.log('resolved'))
```

## Explanation

**Sync:** the three workers start in array order (`A start`, `B start`, `C start`) and each pauses on its timer. `main` pauses on `allSettled`.

**~10 ms:** B wakes and throws, rejecting its promise. `allSettled` records the rejection as a result rather than failing, and nothing is unhandled.

**~20 ms:** `C done`. **~30 ms:** `A done`. Every job has now settled, so in the same task's microtasks `main` resumes and logs the statuses in input order: `fulfilled,rejected,fulfilled`.

**Tail:** `micro` is queued, a timer is added, then `await null` queues `main`'s continuation **behind** `micro`. So `micro`, then `main end`. `main` returns, which fulfils its promise and queues the `then`: `resolved`. The microtask queue is now empty, so the timer finally runs: `timer`.

Rule to remember: `allSettled` never rejects, and after an `await` the order is still FIFO microtasks first, then the next task.
