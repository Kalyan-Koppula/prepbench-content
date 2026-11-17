---
title: return vs return await inside try
difficulty: Hard
order: 14
tags: [async-await, errors]
frequency: medium
expected: |
  without rejected: boom
  with: handled inside
---

```js
async function boom() {
  await null
  throw new Error('boom')
}

async function withoutAwait() {
  try {
    return boom()
  } catch (e) {
    return 'handled inside'
  }
}

async function withAwait() {
  try {
    return await boom()
  } catch (e) {
    return 'handled inside'
  }
}

withoutAwait().then(
  (v) => console.log('without:', v),
  (e) => console.log('without rejected:', e.message)
)
withAwait().then(
  (v) => console.log('with:', v),
  (e) => console.log('with rejected:', e.message)
)
```

## Explanation

`boom()` doesn't throw when called; it returns a promise that rejects one tick later.

**`withoutAwait`:** `return boom()` hands the pending promise straight out. The function body, and its `try`, is finished, so the later rejection never passes through the `catch`. `withoutAwait()`'s promise adopts `boom()`'s promise and rejects: `without rejected: boom`.

**`withAwait`:** `await boom()` keeps the function suspended *inside* the `try`. When the promise rejects, `await` throws at that line, the `catch` runs, and the function fulfils with `'handled inside'`.

Order: `withoutAwait`'s promise starts adopting `boom()`'s promise at the `return`, so it rejects right after `boom()` does. `withAwait` still has to resume and run its `catch` before it fulfils, so the `without` line logs first.

Rule to remember: inside `try`, write `return await`. Without the `await`, the `catch` can't see the rejection.
