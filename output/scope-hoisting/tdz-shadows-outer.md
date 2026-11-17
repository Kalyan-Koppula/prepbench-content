---
title: The TDZ hides the outer variable
difficulty: Medium
order: 2
tags: [tdz, let-const, shadowing]
frequency: high
expected: |
  ReferenceError
  inner
  outer
---

```js
const level = 'outer'

function read() {
  try {
    console.log(level)
  } catch (e) {
    console.log(e.name)
  }
  const level = 'inner'
  console.log(level)
}

read()
console.log(level)
```

## Explanation

`let` and `const` are hoisted too, but they are not initialised. From the start of their scope until the declaration line runs, the binding is in the **temporal dead zone** (TDZ), and touching it throws a `ReferenceError`.

1. Calling `read()` creates its scope, which already contains an uninitialised `level`. That inner `level` **shadows** the global one for the whole function body, not just from its line onwards.
2. The first `console.log(level)` therefore resolves to the inner binding, which is still in the TDZ. It throws, and the catch logs `ReferenceError`. Lookup does not fall back to the outer `'outer'`.
3. `const level = 'inner'` initialises the binding; the next log prints `inner`.
4. Back at the top level, the global `level` was never touched: `outer`.

Rule to remember: a `let`/`const` owns its name for the whole block, so code above the declaration hits the TDZ instead of the outer variable.
