---
title: try/catch around await
difficulty: Easy
order: 4
tags: [async-await, errors]
frequency: medium
expected: |
  sync
  caught nope
  finally
  main done
---

```js
async function risky() {
  throw new Error('nope')
}

async function main() {
  try {
    const v = await risky()
    console.log('got', v)
  } catch (e) {
    console.log('caught', e.message)
  } finally {
    console.log('finally')
  }
  return 'main done'
}

main().then((v) => console.log(v))
console.log('sync')
```

## Explanation

1. `risky()` throws, but inside an `async` function a throw doesn't escape synchronously. It rejects the returned promise.
2. `main` hits `await` on that rejected promise and pauses. `sync` logs.
3. When `main` resumes, `await` **throws** the rejection reason at that line, so `got` is skipped and the `catch` block runs: `caught nope`.
4. `finally` logs, the function continues after the `try`, and returns `'main done'`, which fulfils `main()`'s promise.
5. The `then` logs `main done`.

Rule to remember: `await` turns a rejection back into a thrown exception, so ordinary `try`/`catch`/`finally` handles it.
