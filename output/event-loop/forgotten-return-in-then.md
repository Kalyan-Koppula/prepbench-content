---
title: A nested chain that isn't returned
difficulty: Medium
order: 9
tags: [promises, chaining, microtasks]
frequency: high
expected: |
  1
  2
  4
  3
---

```js
Promise.resolve()
  .then(() => {
    console.log(1)
    Promise.resolve()
      .then(() => console.log(2))
      .then(() => console.log(3))
  })
  .then(() => console.log(4))
```

## Explanation

1. The first handler runs as a microtask and logs `1`.
2. Inside it, an inner chain starts: `2` is queued right away (its promise is already resolved).
3. The handler returns `undefined` because the inner chain is not `return`ed, so the outer promise fulfils immediately and `4` is queued. Queue: `[2, 4]`.
4. `2` runs and queues `3`. Queue: `[4, 3]`.
5. `4`, then `3`.

If the handler had `return`ed the inner chain, the outer `then` would wait for it and the output would be `1 2 3 4`.

Rule to remember: a `then` handler only waits for promises it **returns**. Anything it starts and drops runs on its own.
