---
title: Async arrows and IIFEs
difficulty: Easy
order: 5
tags: [async-await, iife]
frequency: medium
expected: |
  iife start
  outside
  hi ada
  hi bob
---

```js
const greet = async (name) => `hi ${name}`

;(async () => {
  console.log('iife start')
  const msg = await greet('ada')
  console.log(msg)
})()

console.log('outside')

greet('bob').then((msg) => console.log(msg))
```

## Explanation

1. `greet` is an async arrow function, so it returns a promise even though its body is a single expression.
2. The async IIFE starts immediately and runs synchronously until its `await`: `iife start`. `greet('ada')` returns an already-fulfilled promise, and the rest of the IIFE is queued as a microtask.
3. `outside` logs.
4. `greet('bob').then(...)` queues a second microtask behind the IIFE's continuation.
5. Microtasks in order: `hi ada`, `hi bob`.

The leading `;` matters: without it, the previous line's expression would try to call the parenthesised function.

Rule to remember: an async IIFE starts right away, but anything after its first `await` waits for the current script to finish.
