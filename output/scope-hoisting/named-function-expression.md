---
title: The name of a named function expression
difficulty: Hard
order: 14
tags: [functions, scope]
frequency: low
expected: |
  done
  undefined
  function
---

```js
const countdown = function tick(n) {
  if (n === 0) return 'done'
  return tick(n - 1)
}

console.log(countdown(3))
console.log(typeof tick)

const fixed = function rename() {
  rename = 42
  return typeof rename
}

console.log(fixed())
```

## Explanation

A **named function expression** binds its name in a tiny scope that only the function body can see.

1. Inside `tick`, the name `tick` refers to the function itself, so the recursion works and returns `done`.
2. Outside, nothing declared `tick`: the name lives only inside the function. `typeof tick` is `undefined`.
3. That inner name binding is read-only. In sloppy mode, `rename = 42` fails silently (in strict mode it would throw a `TypeError`), so `typeof rename` is still `function`.

Rule to remember: a function expression's own name is a private, read-only reference to itself; it doesn't leak into the enclosing scope.
