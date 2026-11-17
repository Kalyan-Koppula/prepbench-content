---
title: Promise.race takes the first to settle
difficulty: Medium
order: 17
tags: [promise-race, errors, timers]
frequency: medium
expected: |
  settle oops
  lost oops
  settle mid
  settle slow
---

```js
const after = (ms, v, fail) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      console.log('settle', v)
      fail ? reject(new Error(v)) : resolve(v)
    }, ms)
  )

Promise.race([after(40, 'slow'), after(10, 'oops', true), after(20, 'mid')])
  .then((v) => console.log('won', v))
  .catch((e) => console.log('lost', e.message))
```

## Explanation

1. All three timers start immediately.
2. At ~10 ms, `oops` settles first, and it settles by **rejecting**. `race` doesn't wait for a fulfilment; it copies whatever settles first. So the `then` is skipped and `lost oops` logs.
3. `mid` and `slow` still run to completion and log, but their results are ignored.

If you want the first *success*, use `Promise.any`.

Rule to remember: `race` = first to settle, win or lose; `any` = first to fulfil.
