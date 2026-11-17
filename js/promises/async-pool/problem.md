---
title: Async pool (concurrency limit)
difficulty: Medium
order: 10
tags: [promises, concurrency, queues]
frequency: high
exports: [asyncPool]
hints:
  - Start `limit` tasks up front. Every time one finishes, start the next unstarted task, if there is one.
  - Keep a `next` index for the next task to start and a counter of finished tasks; write each result at its task's index.
  - On the first failure, reject and stop launching new tasks.
---

Implement `asyncPool(tasks, limit)`. `tasks` is an array of functions that each start some async work and return a promise (or a plain value). Run them so that **at most `limit` are in flight at once**, starting them in array order, and starting the next one **as soon as** any running task finishes.

The returned promise fulfils with every task's result **in the order of `tasks`**, regardless of finishing order.

```js
const urls = ['/a', '/b', '/c', '/d', '/e']
const pages = await asyncPool(urls.map((u) => () => fetch(u).then((r) => r.text())), 2)
// never more than 2 requests open at a time; pages[i] is the body of urls[i]
```

## Notes

- Call each task exactly once, and only when it is its turn. The first `min(limit, tasks.length)` tasks start synchronously when `asyncPool` is called.
- If a task fails (rejects or throws), reject with that error straight away and start no further tasks. Tasks already running are left to finish.
- An empty `tasks` array fulfils with `[]`. `limit` is a positive integer and may exceed `tasks.length`.
