---
title: Classes are not hoisted like functions
difficulty: Easy
order: 13
tags: [classes, hoisting]
frequency: medium
expected: |
  ReferenceError
  called
  TypeError
  function
---

```js
try {
  new Early()
} catch (e) {
  console.log(e.name)
}

class Early {}

function Old() {
  return 'called'
}

console.log(Old())

try {
  Early()
} catch (e) {
  console.log(e.name)
}

console.log(typeof Early)
```

## Explanation

Classes are mostly sugar over constructor functions, but not entirely.

1. A `class` declaration behaves like `let`: hoisted but uninitialised. Using it before its line hits the temporal dead zone: `ReferenceError`.
2. A constructor function written with `function` can also be called without `new`: `called`.
3. A class constructor refuses to be called without `new`: `TypeError`.
4. Under the hood a class is still a function object: `typeof Early` is `function`.

Rule to remember: a class is a function that must be called with `new` and can't be used before its declaration.
