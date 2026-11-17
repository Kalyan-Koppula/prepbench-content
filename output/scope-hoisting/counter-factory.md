---
title: Two counters from one factory
difficulty: Easy
order: 17
tags: [closures, private-state]
frequency: high
expected: |
  2 -1
  3 0
  undefined
---

```js
function createCounter() {
  let count = 0
  return {
    inc: () => ++count,
    dec: () => --count,
    value: () => count,
  }
}

const a = createCounter()
const b = createCounter()

a.inc()
a.inc()
b.dec()

console.log(a.value(), b.value())
console.log(a.inc(), b.inc())
console.log(typeof a.count)
```

## Explanation

Every call to `createCounter` creates a new scope with its own `count`. The three methods returned from one call share that `count`; they don't share it with the other call's methods.

1. `a` is incremented twice: `2`. `b` is decremented once: `-1`.
2. Prefix `++` returns the new value, so `a.inc()` gives `3` and `b.inc()` gives `0`.
3. `count` is a variable in the closure, not a property of the returned object, so `a.count` is `undefined`.

Rule to remember: each factory call makes a fresh, private scope; closures are how you get private state without classes.
