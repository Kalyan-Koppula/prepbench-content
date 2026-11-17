---
title: The executor runs synchronously
difficulty: Easy
order: 2
tags: [promises, executor]
frequency: high
expected: |
  A
  B
  D
  E
  C
---

```js
console.log('A')

const p = new Promise((resolve) => {
  console.log('B')
  resolve('C')
  console.log('D')
})

p.then((value) => console.log(value))

console.log('E')
```

## Explanation

1. `A` logs.
2. `new Promise(executor)` calls the executor **immediately and synchronously**, so `B` logs.
3. `resolve('C')` fulfils `p`, but it is not a `return`: the executor keeps going and `D` logs.
4. `p.then(...)` is attached to an already-fulfilled promise. Handlers never run synchronously, so the callback is queued as a microtask.
5. `E` logs and the script ends.
6. The microtask queue drains: `C` logs.

Rule to remember: only the *handlers* (`then`/`catch`/`finally`) are async; the executor runs on the spot, and code after `resolve` still runs.
