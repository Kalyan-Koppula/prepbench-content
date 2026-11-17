---
title: Reassigning vs mutating a reference
difficulty: Easy
order: 1
tags: [references]
frequency: high
expected: |
  2
  2 3
  1 2
---

```js
let a = { n: 1 }
let b = a

b.n = 2
console.log(a.n)

b = { n: 3 }
console.log(a.n, b.n)

let x = 1
let y = x
y++
console.log(x, y)
```

## Explanation

1. `let b = a` copies the **reference**: `a` and `b` point to the same object. `b.n = 2` mutates that shared object, so `a.n` is `2`.
2. `b = { n: 3 }` points `b` at a brand-new object. It doesn't touch the object `a` still points to: `2 3`.
3. Primitives are copied by value. `y++` changes only `y`: `1 2`.

Rule to remember: assignment copies the reference, never the object. Mutation through either variable is visible through both; reassignment affects only that variable.
