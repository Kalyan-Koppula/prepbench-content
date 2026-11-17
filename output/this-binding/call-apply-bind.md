---
title: call, apply and a bound function
difficulty: Easy
order: 5
tags: [call-apply-bind, explicit-binding]
frequency: high
expected: |
  yo B
  hey A
  hi A
  hi A
---

```js
function describe(greeting) {
  return `${greeting} ${this.id}`
}

const a = { id: 'A' }
const b = { id: 'B' }

const boundToA = describe.bind(a, 'hi')

console.log(describe.call(b, 'yo'))
console.log(describe.apply(a, ['hey']))
console.log(boundToA.call(b, 'ignored'))
console.log(boundToA())
```

## Explanation

1. `call(b, 'yo')` invokes immediately with `this = b` and the arguments listed: `yo B`.
2. `apply(a, ['hey'])` is the same, with the arguments as an array: `hey A`.
3. `bind(a, 'hi')` returns a new function with `this` fixed to `a` and `'hi'` pre-filled as the first argument. Calling it with `call(b, 'ignored')` can't change `this`, and `'ignored'` arrives as a *second* argument, which `describe` doesn't use: `hi A`.
4. Calling it plainly gives the same: `hi A`.

Rule to remember: `call`/`apply` set `this` for one call; `bind` sets it for good, and later `call`/`apply` can only append arguments.
