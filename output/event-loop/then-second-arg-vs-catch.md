---
title: then(onOk, onErr) vs catch
difficulty: Medium
order: 13
tags: [promises, errors]
frequency: medium
expected: |
  D: early
  B: from ok
---

```js
Promise.resolve('ok')
  .then(
    (v) => { throw new Error('from ' + v) },
    () => console.log('A: same then')
  )
  .catch((e) => console.log('B:', e.message))

Promise.reject(new Error('early'))
  .then(
    () => console.log('C'),
    (e) => console.log('D:', e.message)
  )
  .catch(() => console.log('E'))
```

## Explanation

**Chain 1:** the promise is fulfilled, so the first argument runs and throws. The second argument of the **same** `then` only handles rejections of the promise *before* it, so `A` never runs. The throw rejects the promise returned by `then`, and the `catch` one step later receives it.

**Chain 2:** the promise is rejected, so the second argument runs and logs `D: early`. It returns `undefined`, which *recovers* the chain, so `E` never runs.

**Order:** both first steps run in the first microtask round (chain 1 logs nothing there, chain 2 logs `D`). `B` needs one more hop, so it logs in the second round.

Rule to remember: `then(ok, err)` doesn't catch errors thrown by `ok`; `then(ok).catch(err)` does.
