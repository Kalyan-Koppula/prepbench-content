---
title: Promise.all keeps input order
difficulty: Medium
order: 15
tags: [promise-all, timers]
frequency: high
expected: |
  started
  done b
  done a
  ["a","b","c"]
---

```js
const wait = (ms, v) =>
  new Promise((resolve) =>
    setTimeout(() => {
      console.log('done', v)
      resolve(v)
    }, ms)
  )

Promise.all([wait(30, 'a'), wait(10, 'b'), 'c'])
  .then((vals) => console.log(JSON.stringify(vals)))

console.log('started')
```

## Explanation

1. Both `wait` calls start their timers right away, during the sync pass. `Promise.all` doesn't start anything; it only watches. `'c'` isn't a promise, so it's wrapped with `Promise.resolve('c')`.
2. `started` logs.
3. At ~10 ms the `b` timer fires: `done b`. At ~30 ms: `done a`.
4. The last input has now fulfilled, so `Promise.all` fulfils with the values **in input order**, not completion order: `["a","b","c"]`.

Rule to remember: `Promise.all` results line up with the input array, and plain values count as already-fulfilled promises.
