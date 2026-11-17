---
title: finally passes values through
difficulty: Medium
order: 14
tags: [promises, finally, errors]
frequency: medium
expected: |
  finally 1
  then data
  finally 2
  catch bad
  finally 3 undefined
---

```js
Promise.resolve('data')
  .finally(() => {
    console.log('finally 1')
    return 'ignored'
  })
  .then((v) => console.log('then', v))
  .then(() => {
    throw new Error('bad')
  })
  .finally(() => console.log('finally 2'))
  .catch((e) => console.log('catch', e.message))
  .finally((x) => console.log('finally 3', x))
```

## Explanation

1. `finally 1` logs. Its return value `'ignored'` is thrown away and the original value `'data'` continues down the chain.
2. `then data` logs.
3. The next `then` throws, so the chain is rejected.
4. `finally` runs for rejections too: `finally 2` logs. It doesn't handle the error; the rejection passes through it unchanged.
5. `catch bad` handles it and returns `undefined`, so the chain is fulfilled again.
6. A `finally` callback is called with **no arguments**, so `x` is `undefined`: `finally 3 undefined`.

Rule to remember: `finally` sees nothing and changes nothing, unless it throws or returns a rejected promise.
