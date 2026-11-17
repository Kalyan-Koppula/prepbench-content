---
title: IIFE scope
difficulty: Easy
order: 9
tags: [iife, scope]
frequency: medium
expected: |
  2
  1
  3
---

```js
var count = 1

;(function () {
  var count = 2
  console.log(count)
})()

console.log(count)

;(function () {
  count = 3
})()

console.log(count)
```

## Explanation

An IIFE (immediately invoked function expression) is just a function call, so it gets its own function scope.

1. The first IIFE declares its own `var count`, which shadows the global one. It logs `2` and the global is untouched.
2. The global still logs `1`.
3. The second IIFE has no declaration, so `count = 3` walks out to the global scope and assigns there. The last log prints `3`.

The leading `;` stops the parenthesis from being read as a call on the previous line's value when semicolons are omitted.

Rule to remember: an IIFE isolates what it *declares*; plain assignments still reach the outer scope.
