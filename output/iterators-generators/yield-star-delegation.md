---
title: Delegating with yield*
difficulty: Medium
order: 4
tags: [generators, iterables]
frequency: medium
expected: |
  inner returned inner result
  o1,i1,i2,x,y
---

```js
function* inner() {
  yield 'i1'
  yield 'i2'
  return 'inner result'
}

function* outer() {
  yield 'o1'
  const r = yield* inner()
  console.log('inner returned', r)
  yield* ['x', 'y']
}

console.log([...outer()].join(','))
```

## Explanation

1. Spreading `outer()` pulls values until the generator is done. That happens *before* `join` and the outer `console.log` run, so the log inside the generator comes first.
2. `yield 'o1'` gives `o1`.
3. `yield* inner()` forwards every value `inner` yields (`i1`, `i2`). The **return value** of `inner` is not yielded; it becomes the value of the `yield*` expression, so `r = 'inner result'` and the log runs.
4. `yield*` works on any iterable, so the array contributes `x` and `y`.
5. The collected values are joined: `o1,i1,i2,x,y`.

Rule to remember: `yield*` passes through yielded values; the delegate's `return` value goes to the expression, not to the consumer.
