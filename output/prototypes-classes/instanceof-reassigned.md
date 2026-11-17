---
title: What instanceof actually checks
difficulty: Hard
order: 4
tags: [instanceof, prototype-chain]
frequency: medium
expected: |
  false
  true
  false A
  false true
---

```js
function A() {}
function B() {}

const a = new A()
console.log(a instanceof B)

B.prototype = A.prototype
console.log(a instanceof B)
console.log(a.constructor === B, a.constructor.name)

A.prototype = {}
console.log(a instanceof A, a instanceof B)
```

## Explanation

`x instanceof F` does not ask "was `x` made by `F`?". It asks "does the **current** `F.prototype` appear anywhere in `x`'s prototype chain?"

1. `a`'s chain is `A.prototype (original) → Object.prototype`. `B.prototype` isn't in it: `false`.
2. After `B.prototype = A.prototype`, `B.prototype` *is* the object in `a`'s chain: `true`.
3. `constructor` is just a property on that shared prototype object, and it still points to `A`: `false A`.
4. `A.prototype = {}` points `A` at a new object. `a`'s chain still holds the original one, so `a instanceof A` is now `false`, while `B.prototype` still matches: `true`.

Rule to remember: `instanceof` compares against `F.prototype` at the moment you ask, so reassigning prototypes can flip the answer for existing objects.
