---
title: Chaining vs attaching to the same promise
difficulty: Medium
order: 8
tags: [promises, microtasks, chaining]
frequency: medium
expected: |
  a1
  b1
  b2
  a2
---

```js
const p = Promise.resolve()

p.then(() => console.log('a1'))
  .then(() => console.log('a2'))

p.then(() => console.log('b1'))
p.then(() => console.log('b2'))
```

## Explanation

There are three handlers directly on `p` (`a1`, `b1`, `b2`) and one handler (`a2`) on the **new** promise returned by `p.then(a1)`.

1. `p` is already fulfilled, so each `p.then(...)` immediately queues its handler. Microtasks: `[a1, b1, b2]`.
2. `a1` runs. Its promise fulfils, which queues `a2` at the back: `[b1, b2, a2]`.
3. `b1`, `b2`, then `a2`.

Rule to remember: `p.then(x).then(y)` makes `y` wait for `x`, but `p.then(x); p.then(y)` registers siblings that run back to back.
