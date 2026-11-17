---
title: Function declaration vs function expression
difficulty: Easy
order: 4
tags: [hoisting, functions]
frequency: high
expected: |
  hello
  TypeError
  undefined
  bye
---

```js
console.log(greet())

try {
  console.log(farewell())
} catch (e) {
  console.log(e.name)
}

console.log(typeof farewell)

function greet() {
  return 'hello'
}

var farewell = function () {
  return 'bye'
}

console.log(farewell())
```

## Explanation

1. A **function declaration** is hoisted with its body, so `greet()` works on line 1 and logs `hello`.
2. `farewell` is a `var` holding a **function expression**. Only the `var` is hoisted, as `undefined`. Calling `undefined()` throws a `TypeError` (not a `ReferenceError`: the name exists, it just isn't a function).
3. `typeof farewell` is still `undefined` because the assignment line hasn't run yet.
4. After `var farewell = function …` runs, the call works: `bye`.

Rule to remember: declarations are hoisted whole; expressions are only as hoisted as the variable that holds them.
