---
title: typeof is not always safe
difficulty: Medium
order: 3
tags: [typeof, tdz]
frequency: medium
expected: |
  undefined
  ReferenceError
  number
---

```js
console.log(typeof ghost)

try {
  console.log(typeof pending)
} catch (e) {
  console.log(e.name)
}

let pending = 1
console.log(typeof pending)
```

## Explanation

1. `ghost` is not declared anywhere. `typeof` has a special case for unresolvable names: instead of throwing, it returns the string `'undefined'`.
2. `pending` **is** declared, with `let`, later in the same scope. The name resolves, but the binding is in the temporal dead zone, so reading it (even through `typeof`) throws a `ReferenceError`.
3. After `let pending = 1` runs, `typeof pending` is `number`.

Rule to remember: `typeof` only protects you from names that don't exist at all; a `let`/`const`/`class` in its TDZ still throws.
