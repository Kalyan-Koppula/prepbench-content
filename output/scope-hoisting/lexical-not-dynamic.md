---
title: Scope comes from where code is written
difficulty: Medium
order: 13
tags: [lexical-scope, shadowing]
frequency: high
expected: |
  outer
  second
---

```js
let value = 'outer'

function first() {
  console.log(value)
}

function second() {
  let value = 'second'
  first()
  const third = () => console.log(value)
  third()
}

second()
```

## Explanation

JavaScript uses **lexical scope**: a function looks up free variables in the scopes surrounding where it was *defined*, never in the scope of whoever called it.

1. `second()` declares its own `value = 'second'`, then calls `first()`.
2. `first` was written at the top level. Its outer scope is the global one, so it logs `outer`, even though the caller has a `value` of its own.
3. `third` is defined inside `second`, so its outer scope is `second`'s scope. It logs `second`.

Rule to remember: who calls a function never changes which variables it sees; only where it was written does.
