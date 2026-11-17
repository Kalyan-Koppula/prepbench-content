---
title: Assigning to an undeclared name
difficulty: Medium
order: 18
tags: [typeof, globals, scope]
frequency: medium
expected: |
  undefined
  undefined oops
  true
---

```js
function init() {
  let local = (leaked = 'oops')
  return local
}

console.log(typeof leaked)

init()

console.log(typeof local, leaked)
console.log('leaked' in window)
```

## Explanation

1. Before `init()` runs, `leaked` doesn't exist anywhere. `typeof` on an undeclared name returns `'undefined'` instead of throwing.
2. Inside `init`, `leaked = 'oops'` assigns to a name with no declaration in any scope. In sloppy mode that silently creates a property on the global object: an **implicit global**.
3. `local` was declared with `let` inside `init`, so it doesn't exist outside: `typeof local` is `undefined`. `leaked` is now a global holding `oops`.
4. Because it is a property of the global object, `'leaked' in window` is `true`.

With `'use strict'` the assignment would throw a `ReferenceError` instead, which is one reason strict mode exists.

Rule to remember: in sloppy mode, assigning to an undeclared name creates a global; `typeof` is the only safe way to read a name that may not exist.
